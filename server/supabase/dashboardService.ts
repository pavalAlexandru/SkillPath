import { createClient } from '@/server/supabase/server';

export interface CategorySkill {
    name: string;
    score: number;
}

export interface AchievementBadge {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
}

export interface ActivityDay {
    dayName: string;
    date: string;
    count: number;
}

export interface RecommendationResource {
    title: string;
    url: string;
}

export interface FocusArea {
    id: number;
    categoryName: string;
    topicTitle: string;
    advice: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    createdAt?: string;
    resources: RecommendationResource[];
}

export interface DashboardData {
    firstName: string;
    level: string;
    nextLevel: string;
    levelProgressPercentage: number;
    testsCompleted: number;
    testsThisWeek: number;
    averageScore: number;
    scoreDiffVsMonth: number;
    categoriesPassed: number;
    totalCategories: number;
    currentStreak: number;
    scoreHistory: { date: string; score: number }[];
    focusAreas: FocusArea[];
    allRecommendations: FocusArea[];
    skillsRadar: CategorySkill[];
    difficultyAccuracy: {
        easy: number;
        medium: number;
        hard: number;
    };
    weeklyActivity: ActivityDay[];
    achievements: AchievementBadge[];
}

interface CompletedAssessmentRow {
    id: number;
    total_score: number | string | null;
    started_at: string | null;
    completed_at: string;
    status: string;
}

interface CategoryRow {
    id: number;
    name: string;
    level: string;
}

interface AssessmentScoreRow {
    category_id: number;
    score_percentage: number | string | null;
    assessments: {
        user_id: string;
        status: string;
    } | null;
}

interface RecommendationRow {
    id: number;
    topic_title: string | null;
    advice_description: string | null;
    priority: string | null;
    created_at: string | null;
    category_id: number | null;
    categories: {
        name: string;
    } | null;
    recommendation_resources: {
        title: string;
        url: string;
    }[] | null;
}

function calculateRealStreak(tests: CompletedAssessmentRow[]): number {
    if (!tests || tests.length === 0) return 0;

    const completedDates = new Set<string>();
    tests.forEach((t) => {
        if (t.completed_at) {
            const dateStr = new Date(t.completed_at).toISOString().split('T')[0];
            completedDates.add(dateStr);
        }
    });

    if (completedDates.size === 0) return 0;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!completedDates.has(todayStr) && !completedDates.has(yesterdayStr)) {
        return 0;
    }

    let streak = 0;
    const checkDate = new Date();
    if (!completedDates.has(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (completedDates.has(checkStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

export async function getStudentDashboardData(): Promise<DashboardData | null> {
    const supabase = await createClient();

    // 1. Utilizator autentificat
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    // 2. Profil & Nivel
    const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single();

    const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('current_level')
        .eq('user_id', user.id)
        .single();

    const currentLevel = studentProfile?.current_level || 'JUNIOR';
    const nextLevel = currentLevel === 'JUNIOR' ? 'MIDDLE' : currentLevel === 'MIDDLE' ? 'SENIOR' : 'MASTER';

    // 3. Teste finalizate
    const { data: completedAssessments } = await supabase
        .from('assessments')
        .select('id, total_score, started_at, completed_at, status')
        .eq('user_id', user.id)
        .eq('status', 'COMPLETED')
        .order('completed_at', { ascending: true });

    const tests: CompletedAssessmentRow[] = (completedAssessments as CompletedAssessmentRow[]) || [];
    const testsCompleted = tests.length;

    const currentStreak = calculateRealStreak(tests);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const testsThisWeek = tests.filter((t: CompletedAssessmentRow) => new Date(t.completed_at) >= oneWeekAgo).length;

    const averageScore = testsCompleted > 0
        ? Math.round(tests.reduce((acc: number, curr: CompletedAssessmentRow) => acc + Number(curr.total_score || 0), 0) / testsCompleted)
        : 0;

    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    const testsLastMonth = tests.filter((t: CompletedAssessmentRow) => new Date(t.completed_at) < oneMonthAgo);
    const avgScoreLastMonth = testsLastMonth.length > 0
        ? Math.round(testsLastMonth.reduce((acc: number, curr: CompletedAssessmentRow) => acc + Number(curr.total_score || 0), 0) / testsLastMonth.length)
        : averageScore;
    const scoreDiffVsMonth = averageScore - avgScoreLastMonth;

    // 4. Categorii nivel curent & Promovare (>= 90%)
    const { data: activeCategories } = await supabase
        .from('categories')
        .select('id, name, level')
        .eq('is_active', true)
        .ilike('level', currentLevel);

    const levelCategories: CategoryRow[] = (activeCategories as CategoryRow[]) || [];
    const totalCategories = levelCategories.length;

    const { data: categoryScoresData } = await supabase
        .from('assessment_category_scores')
        .select('category_id, score_percentage, assessments!inner(user_id, status)')
        .eq('assessments.user_id', user.id)
        .eq('assessments.status', 'COMPLETED');

    const scoresList: AssessmentScoreRow[] = (categoryScoresData as unknown as AssessmentScoreRow[]) || [];
    const highestScorePerCategory = new Map<number, number>();

    scoresList.forEach((s: AssessmentScoreRow) => {
        const prev = highestScorePerCategory.get(s.category_id) || 0;
        const currentScore = Number(s.score_percentage || 0);
        if (currentScore > prev) {
            highestScorePerCategory.set(s.category_id, currentScore);
        }
    });

    const categoriesPassed = levelCategories.filter((cat: CategoryRow) => {
        const score = highestScorePerCategory.get(cat.id) || 0;
        return score >= 90;
    }).length;

    const levelProgressPercentage = totalCategories > 0
        ? Math.round((categoriesPassed / totalCategories) * 100)
        : 0;

    // 5. Competențe per categorie din nivelul curent
    const skillsRadar: CategorySkill[] = levelCategories.map((c) => ({
        name: c.name.length > 15 ? `${c.name.slice(0, 13)}...` : c.name,
        score: highestScorePerCategory.get(c.id) || 0,
    }));

    // 6. Acuratețe pe Dificultăți
    const { data: answeredQuestionsData } = await supabase
        .from('assessment_questions')
        .select(`
            is_correct,
            questions!inner ( difficulty ),
            assessments!inner ( user_id, status )
        `)
        .eq('assessments.user_id', user.id)
        .eq('assessments.status', 'COMPLETED');

    let easyCorrect = 0, easyTotal = 0;
    let medCorrect = 0, medTotal = 0;
    let hardCorrect = 0, hardTotal = 0;

    (answeredQuestionsData || []).forEach((row: any) => {
        const diff = row.questions?.difficulty?.toUpperCase();
        const ok = row.is_correct ? 1 : 0;
        if (diff === 'EASY') { easyTotal++; easyCorrect += ok; }
        else if (diff === 'MEDIUM') { medTotal++; medCorrect += ok; }
        else if (diff === 'HARD') { hardTotal++; hardCorrect += ok; }
    });

    const difficultyAccuracy = {
        easy: easyTotal > 0 ? Math.round((easyCorrect / easyTotal) * 100) : 0,
        medium: medTotal > 0 ? Math.round((medCorrect / medTotal) * 100) : 0,
        hard: hardTotal > 0 ? Math.round((hardCorrect / hardTotal) * 100) : 0,
    };

    // 7. Activitate săptămânală
    const dayNames = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
    const weeklyActivity: ActivityDay[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayTests = tests.filter((t) => t.completed_at?.startsWith(dateStr)).length;
        weeklyActivity.push({
            dayName: dayNames[d.getDay()],
            date: d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' }),
            count: dayTests,
        });
    }

    // 8. Achievements
    const hasPerfectScore = tests.some((t) => Number(t.total_score || 0) === 100);
    const achievements: AchievementBadge[] = [
        {
            id: 'first_step',
            title: 'Primul Pas',
            description: 'Finalizează prima ta evaluare',
            icon: '🎯',
            unlocked: testsCompleted >= 1,
        },
        {
            id: 'fast_learner',
            title: 'Învățare Rapidă',
            description: 'Finalizează cel puțin 5 teste',
            icon: '⚡',
            unlocked: testsCompleted >= 5,
        },
        {
            id: 'perfectionist',
            title: 'Perfecționist',
            description: 'Obține scorul de 100% la un test',
            icon: '🏆',
            unlocked: hasPerfectScore,
        },
        {
            id: 'category_master',
            title: 'Master de Categorie',
            description: 'Promovează cel puțin o categorie cu ≥90%',
            icon: '🛡️',
            unlocked: categoriesPassed >= 1,
        },
    ];

    // 9. Istoric evoluție scor
    const scoreHistory = tests.slice(-6).map((t: CompletedAssessmentRow) => ({
        date: new Date(t.completed_at).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' }),
        score: Math.round(Number(t.total_score || 0)),
    }));

    // 10. Toate Recomandările din baza de date
    const { data: recommendationsData } = await supabase
        .from('learning_recommendations')
        .select(`
            id,
            topic_title,
            advice_description,
            priority,
            created_at,
            category_id,
            categories ( name ),
            recommendation_resources ( title, url ),
            assessments!inner ( user_id )
        `)
        .eq('assessments.user_id', user.id)
        .order('created_at', { ascending: false });

    const recsList: RecommendationRow[] = (recommendationsData as unknown as RecommendationRow[]) || [];
    const allRecommendations: FocusArea[] = recsList.map((r: RecommendationRow) => {
        const resources = (r.recommendation_resources || []).map((res) => ({
            title: res.title,
            url: res.url,
        }));

        return {
            id: r.id,
            categoryName: r.categories?.name || 'General',
            topicTitle: r.topic_title || 'Concept fundamental',
            advice: r.advice_description || 'Necesită aprofundare suplimentară.',
            priority: (r.priority as 'LOW' | 'MEDIUM' | 'HIGH') || 'MEDIUM',
            createdAt: r.created_at
                ? new Date(r.created_at).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })
                : undefined,
            resources,
        };
    });

    const focusAreas = allRecommendations.slice(0, 2);

    return {
        firstName: profile?.first_name || 'Student',
        level: currentLevel,
        nextLevel,
        levelProgressPercentage,
        testsCompleted,
        testsThisWeek,
        averageScore,
        scoreDiffVsMonth,
        categoriesPassed,
        totalCategories,
        currentStreak,
        scoreHistory,
        focusAreas,
        allRecommendations,
        skillsRadar,
        difficultyAccuracy,
        weeklyActivity,
        achievements,
    };
}