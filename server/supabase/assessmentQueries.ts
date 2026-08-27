import { createClient } from './server';
import {
    QuestionItem,
    DifficultyLevel,
    QuestionType,
    StudentLevel,
} from '@/types/assesments';
import { getCurrentStudentLevel } from './profileService';
import { getCategoriesByLevel } from './categoryService';
import { shuffleArray } from './assessmentScoring';
import { ASSESSMENT_CONFIG, DifficultyCount } from '@/config/assessmentConfig';
import { headers } from 'next/headers';

interface RawQuestionOption {
    id: number;
    question_id: number;
    option_text: string;
    is_correct: boolean;
}

interface RawQuestionQuery {
    id: number;
    category_id: number;
    question_text: string;
    difficulty: string;
    question_type: string;
    categories?: { name: string; level: string } | null;
    options: RawQuestionOption[];
}

export async function getAssessmentQuestions(
    categoryIdOrMode?: string | number,
    _overrideCount?: number,
    forcedLevel?: StudentLevel
): Promise<QuestionItem[]> {
    const supabase = await createClient();
    const dbLevel = await getCurrentStudentLevel();
    const activeLevel: StudentLevel = forcedLevel || dbLevel || 'JUNIOR';

    const isOnboarding = categoryIdOrMode === 'onboarding';
    const targetCount = isOnboarding
        ? ASSESSMENT_CONFIG.onboardingQuestionCount
        : ASSESSMENT_CONFIG.standardQuestionCount;

    // --- E2E Mocking Fallback ---
    let isE2E = false;
    try {
        const headersList = await headers();
        isE2E = headersList.get('x-e2e-test') === 'true';
    } catch (e) {
        // Not in request context
    }

    if (isE2E || process.env.NODE_ENV === 'test') {
        const mockQuestions: QuestionItem[] = Array.from({ length: targetCount }).map((_, i) => ({
            id: i + 1,
            categoryId: Number(categoryIdOrMode) || 1,
            categoryName: 'Mock Category',
            questionText: `Mock Question ${i + 1}`,
            difficulty: 'EASY',
            questionType: 'SINGLE',
            options: [
                { id: i * 10 + 1, questionId: i + 1, optionText: 'Option A (Correct)', isCorrect: true },
                { id: i * 10 + 2, questionId: i + 1, optionText: 'Option B', isCorrect: false },
                { id: i * 10 + 3, questionId: i + 1, optionText: 'Option C', isCorrect: false },
                { id: i * 10 + 4, questionId: i + 1, optionText: 'Option D', isCorrect: false },
            ]
        }));
        return mockQuestions;
    }
    // ----------------------------

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

    if (
        categoryIdOrMode &&
        categoryIdOrMode !== 'surprise' &&
        categoryIdOrMode !== 'onboarding' &&
        !isNaN(Number(categoryIdOrMode))
    ) {
        query = query.eq('category_id', Number(categoryIdOrMode));
    } else {
        const levelCategories = await getCategoriesByLevel(activeLevel);
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
        difficulty: (q.difficulty?.toUpperCase() as DifficultyLevel) || 'EASY',
        questionType: (q.question_type?.toUpperCase() as QuestionType) || 'SINGLE',
        options: shuffleArray(
            (q.options || []).map((opt) => ({
                id: opt.id,
                questionId: opt.question_id,
                optionText: opt.option_text,
                isCorrect: opt.is_correct,
            }))
        ),
    }));

    const easyPool = shuffleArray(allFormatted.filter((q) => q.difficulty === 'EASY'));
    const mediumPool = shuffleArray(allFormatted.filter((q) => q.difficulty === 'MEDIUM'));
    const hardPool = shuffleArray(allFormatted.filter((q) => q.difficulty === 'HARD'));

    // Preluăm numerele exacte de întrebări din configurare
    const targetDistribution: DifficultyCount = isOnboarding
        ? ASSESSMENT_CONFIG.onboardingDifficultyDistribution
        : ASSESSMENT_CONFIG.difficultyDistribution[activeLevel] || ASSESSMENT_CONFIG.difficultyDistribution.JUNIOR;

    const selected: QuestionItem[] = [
        ...easyPool.slice(0, targetDistribution.EASY),
        ...mediumPool.slice(0, targetDistribution.MEDIUM),
        ...hardPool.slice(0, targetDistribution.HARD),
    ];

    // Dacă o categorie are mai puține întrebări pe o dificultate anume, completăm din restul disponibile
    if (selected.length < targetCount) {
        const selectedIds = new Set(selected.map((q) => q.id));
        const remaining = shuffleArray(allFormatted.filter((q) => !selectedIds.has(q.id)));
        selected.push(...remaining.slice(0, targetCount - selected.length));
    }

    return shuffleArray(selected).slice(0, targetCount);
}