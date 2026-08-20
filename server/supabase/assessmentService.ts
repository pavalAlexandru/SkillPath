import { createClient } from './server';
import {
    QuestionItem,
    DifficultyLevel,
    QuestionType,
} from '@/types/assesments';

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
    options: RawQuestionOption[];
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export async function getJuniorCategories() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('categories')
        .select('id, name, description, level')
        .eq('level', 'JUNIOR')
        .eq('is_active', true)
        .order('id', { ascending: true });

    if (error || !data) {
        console.error('Eroare la preluarea categoriilor:', error);
        return [];
    }

    return data;
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
    }

    const { data: qData, error: qError } = await query;

    if (qError || !qData || qData.length === 0) {
        console.error('Eroare sau nu există întrebări în Supabase:', qError);
        return [];
    }

    const rawQuestions = qData as unknown as RawQuestionQuery[];

    const allFormatted: QuestionItem[] = rawQuestions.map((q) => ({
        id: q.id,
        categoryId: q.category_id,
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