import { createClient } from './server';
import { StudentLevel } from '@/types/assesments';
import { getCategoriesByLevel } from './categoryService';
import { ASSESSMENT_CONFIG } from '@/config/assessmentConfig';

interface CategoryScoreRow {
    category_id: number;
    score_percentage: number | string;
}

export async function checkAndApplyLevelUp(userId: string, currentLevel: StudentLevel) {
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

    // Verifică dacă toate categoriile nivelului au atins pragul din config (90%)
    const allPassedThreshold = categories.every(
        (cat) => (maxScorePerCategory[cat.id] || 0) >= ASSESSMENT_CONFIG.passingScorePercentage
    );

    if (allPassedThreshold) {
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