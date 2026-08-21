import { createClient } from './server';
import {
    QuestionItem,
    QuestionOption,
    DifficultyLevel,
    QuestionType,
    StudentLevel,
} from '@/types/assesments';
import { getCurrentStudentLevel } from './profileService';
import { getCategoriesByLevel } from './categoryService';

export interface CategoryProgress {
    categoryId: number;
    lastScore: number;
    passed: boolean;
    completedAt: string;
}

interface RawQuestionOption {
    id: number;
    question_id: number;
    option_text: string;
    is_correct: boolean;
}

interface RawCategory {
    name: string;
    level: string;
}

interface RawQuestionQuery {
    id: number;
    category_id: number;
    question_text: string;
    difficulty: string;
    question_type: string;
    categories?: RawCategory | null;
    options: RawQuestionOption[];
}

interface CategoryScoreRow {
    category_id: number;
    score_percentage: number | string;
    assessments?: {
        user_id: string;
        status: string;
        completed_at?: string;
    } | null;
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function calculateSingleQuestionScore(
    selectedIds: number[],
    options: QuestionOption[]
): { score: number; isCorrect: boolean } {
    const correctOptions = options.filter((o) => o.isCorrect);
    const incorrectOptions = options.filter((o) => !o.isCorrect);

    const N = correctOptions.length;
    const M = incorrectOptions.length;

    if (N === 0 || selectedIds.length === 0) {
        return { score: 0, isCorrect: false };
    }

    let correctChosen = 0;
    let incorrectChosen = 0;

    selectedIds.forEach((id) => {
        if (correctOptions.some((o) => o.id === id)) {
            correctChosen++;
        } else {
            incorrectChosen++;
        }
    });

    const penaltyPerWrong = M > 0 ? 1 / M : 0;
    const rewardPerCorrect = 1 / N;

    const rawScore = correctChosen * rewardPerCorrect - incorrectChosen * penaltyPerWrong;
    const finalScore = Math.max(0, rawScore);

    return {
        score: finalScore,
        isCorrect: finalScore === 1,
    };
}

async function checkAndApplyLevelUp(userId: string, currentLevel: StudentLevel) {
    if (currentLevel === 'SENIOR') return;

    const supabase = await createClient();
    const categories = await getCategoriesByLevel(currentLevel);

    if (categories.length === 0) return;

    const { data: scores, error } = await supabase
        .from('assessment_category_scores')
        .select(`
            category_id,
            score_percentage,
            assessments!inner (
                user_id,
                status
            )
        `)
        .eq('assessments.user_id', userId)
        .eq('assessments.status', 'COMPLETED')
        .in('category_id', categories.map((c) => c.id));

    if (error || !scores || scores.length === 0) return;

    const typedScores = scores as unknown as CategoryScoreRow[];
    const maxScorePerCategory: Record<number, number> = {};

    typedScores.forEach((row) => {
        const catId = row.category_id;
        const score = Number(row.score_percentage);
        if (!maxScorePerCategory[catId] || score > maxScorePerCategory[catId]) {
            maxScorePerCategory[catId] = score;
        }
    });

    const allPassed90 = categories.every((cat) => (maxScorePerCategory[cat.id] || 0) >= 90);

    if (allPassed90) {
        const nextLevel: StudentLevel = currentLevel === 'JUNIOR' ? 'MIDDLE' : 'SENIOR';

        await supabase
            .from('student_profiles')
            .update({
                current_level: nextLevel,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
    }
}

export async function getUserCategoryProgress(): Promise<Record<number, CategoryProgress>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return {};

    const { data, error } = await supabase
        .from('assessment_category_scores')
        .select(`
            category_id,
            score_percentage,
            assessments!inner (
                user_id,
                status,
                completed_at
            )
        `)
        .eq('assessments.user_id', user.id)
        .eq('assessments.status', 'COMPLETED')
        .order('id', { ascending: false });

    if (error || !data) {
        console.error('Eroare la preluarea progresului pe categorii:', error);
        return {};
    }

    const typedData = data as unknown as CategoryScoreRow[];
    const progressMap: Record<number, CategoryProgress> = {};

    typedData.forEach((row) => {
        const catId = row.category_id;
        if (!progressMap[catId]) {
            const score = Number(row.score_percentage);
            progressMap[catId] = {
                categoryId: catId,
                lastScore: score,
                passed: score >= 60,
                completedAt: row.assessments?.completed_at || '',
            };
        }
    });

    return progressMap;
}

export async function saveCompletedAssessment(
    categoryIdOrMode: string | number,
    scorePercentage: number,
    answers: Record<number, number[]>,
    questions: QuestionItem[]
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('Utilizatorul nu este autentificat pentru salvarea testului.');
        return null;
    }

    const userLevel = await getCurrentStudentLevel();
    const isSurprise = categoryIdOrMode === 'surprise';
    const singleCatId = !isSurprise && !isNaN(Number(categoryIdOrMode)) ? Number(categoryIdOrMode) : null;

    // 1. Inserare în tabela assessments
    const { data: assessment, error: aErr } = await supabase
        .from('assessments')
        .insert({
            user_id: user.id,
            is_surprise_mode: isSurprise,
            status: 'COMPLETED',
            total_score: scorePercentage,
            completed_at: new Date().toISOString(),
        })
        .select('id')
        .single();

    if (aErr || !assessment) {
        console.error('Eroare inserare in assessments:', aErr);
        return null;
    }

    const newAssessmentId = assessment.id;

    // 2. Inserare în assessment_categories
    const usedCategoryIds = isSurprise
        ? Array.from(new Set(questions.map((q) => q.categoryId)))
        : singleCatId ? [singleCatId] : [];

    if (usedCategoryIds.length > 0) {
        const catInserts = usedCategoryIds.map((cId) => ({
            assessment_id: newAssessmentId,
            category_id: cId,
        }));
        await supabase.from('assessment_categories').insert(catInserts);
    }

    // 3. Inserare în assessment_questions & assessment_answers
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const selectedOptionIds = answers[q.id] || [];
        const { isCorrect } = calculateSingleQuestionScore(selectedOptionIds, q.options);

        const { data: aq, error: aqErr } = await supabase
            .from('assessment_questions')
            .insert({
                assessment_id: newAssessmentId,
                question_id: q.id,
                position: i + 1,
                is_correct: isCorrect,
                answered_at: new Date().toISOString(),
            })
            .select('id')
            .single();

        if (!aqErr && aq && selectedOptionIds.length > 0) {
            const answersToInsert = selectedOptionIds.map((optId) => ({
                assessment_question_id: aq.id,
                option_id: optId,
            }));
            await supabase.from('assessment_answers').insert(answersToInsert);
        }
    }

    // 4. Inserare în assessment_category_scores
    if (!isSurprise && singleCatId) {
        await supabase.from('assessment_category_scores').insert({
            assessment_id: newAssessmentId,
            category_id: singleCatId,
            score_percentage: scorePercentage,
            is_weak_area: scorePercentage < 60,
        });
    } else if (isSurprise) {
        for (const catId of usedCategoryIds) {
            const catQuestions = questions.filter((q) => q.categoryId === catId);
            let catPoints = 0;

            catQuestions.forEach((q) => {
                const sel = answers[q.id] || [];
                const { score } = calculateSingleQuestionScore(sel, q.options);
                catPoints += score;
            });

            const catPct = catQuestions.length > 0 ? Math.round((catPoints / catQuestions.length) * 100) : 0;
            await supabase.from('assessment_category_scores').insert({
                assessment_id: newAssessmentId,
                category_id: catId,
                score_percentage: catPct,
                is_weak_area: catPct < 60,
            });
        }
    }

    // 5. Declanșare automată verificare Level Up
    await checkAndApplyLevelUp(user.id, userLevel);

    return newAssessmentId;
}

export async function getAssessmentQuestions(
    categoryIdOrMode?: string | number,
    limitCount: number = 10
): Promise<QuestionItem[]> {
    const supabase = await createClient();

    let query = supabase
        .from('questions')
        .select(`
            id,
            category_id,
            question_text,
            difficulty,
            question_type,
            categories (
                name,
                level
            ),
            options:question_options (
                id,
                question_id,
                option_text,
                is_correct
            )
        `)
        .eq('is_active', true)
        .eq('status', 'APPROVED');

    if (categoryIdOrMode && categoryIdOrMode !== 'surprise' && !isNaN(Number(categoryIdOrMode))) {
        query = query.eq('category_id', Number(categoryIdOrMode));
    } else {
        const userLevel = await getCurrentStudentLevel();
        const levelCategories = await getCategoriesByLevel(userLevel);
        const categoryIds = levelCategories.map((c) => c.id);

        if (categoryIds.length > 0) {
            query = query.in('category_id', categoryIds);
        }
    }

    const { data: qData, error: qError } = await query;

    if (qError || !qData || qData.length === 0) {
        console.error('Eroare sau nu există întrebări:', qError);
        return [];
    }

    const rawQuestions = qData as unknown as RawQuestionQuery[];

    const allFormatted: QuestionItem[] = rawQuestions.map((q) => ({
        id: q.id,
        categoryId: q.category_id,
        categoryName: q.categories?.name,
        questionText: q.question_text,
        difficulty: q.difficulty as DifficultyLevel,
        questionType: q.question_type as QuestionType,
        options: shuffleArray(
            (q.options || []).map((opt) => ({
                id: opt.id,
                questionId: opt.question_id,
                optionText: opt.option_text,
                isCorrect: opt.is_correct,
            }))
        ),
    }));

    const easyQuestions = shuffleArray(allFormatted.filter((q) => q.difficulty === 'EASY'));
    const mediumQuestions = shuffleArray(allFormatted.filter((q) => q.difficulty === 'MEDIUM'));
    const hardQuestions = shuffleArray(allFormatted.filter((q) => q.difficulty === 'HARD'));

    const selected: QuestionItem[] = [
        ...easyQuestions.slice(0, 4),
        ...mediumQuestions.slice(0, 3),
        ...hardQuestions.slice(0, 3),
    ];

    if (selected.length < limitCount) {
        const selectedIds = new Set(selected.map((q) => q.id));
        const remaining = shuffleArray(allFormatted.filter((q) => !selectedIds.has(q.id)));
        selected.push(...remaining.slice(0, limitCount - selected.length));
    }

    return shuffleArray(selected).slice(0, limitCount);
}