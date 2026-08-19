import { supabase } from './client';
import {
    QuestionItem,
    AssessmentResult,
    DifficultyLevel,
    QuestionType,
} from '@/types/assesments';

/**
 * Structura brută a opțiunii returnate din interogarea Supabase
 */
interface RawQuestionOption {
    id: number;
    question_id: number;
    option_text: string;
    is_correct: boolean;
}

/**
 * Structura brută a întrebării returnate din interogarea Supabase cu join pe opțiuni
 */
interface RawQuestionQuery {
    id: number;
    category_id: number;
    question_text: string;
    difficulty: string;
    question_type: string;
    options: RawQuestionOption[];
}

/**
 * Algoritmul Fisher-Yates pentru amestecarea aleatorie a elementelor dintr-un array
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Preia toate categoriile active de nivel JUNIOR pentru Dashboard
 */
export async function getJuniorCategories() {
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

/**
 * Extrage exact 10 întrebări împărțite pe cote de dificultate:
 * 4 Ușoare (EASY), 3 Medii (MEDIUM), 3 Grele (HARD).
 * Are fallback automat dacă nu există suficiente dintr-un anumit nivel.
 */
export async function getAssessmentQuestions(
    categoryIdOrMode?: string | number,
    limitCount: number = 10
): Promise<QuestionItem[]> {
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

    // Dacă parametrul este ID numeric de categorie (și nu modul "surprise"), filtrăm pe categorie
    if (categoryIdOrMode && categoryIdOrMode !== 'surprise' && !isNaN(Number(categoryIdOrMode))) {
        query = query.eq('category_id', Number(categoryIdOrMode));
    }

    const { data: qData, error: qError } = await query;

    if (qError || !qData || qData.length === 0) {
        console.error('Eroare sau nu există întrebări în Supabase:', qError);
        return [];
    }

    const rawQuestions = qData as unknown as RawQuestionQuery[];

    // 1. Formatăm întrebările și amestecăm variantele de răspuns
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

    // 2. Grupăm întrebările pe categorii de dificultate și le amestecăm intern
    const easyQuestions = shuffleArray(allFormatted.filter((q) => q.difficulty === 'EASY'));
    const mediumQuestions = shuffleArray(allFormatted.filter((q) => q.difficulty === 'MEDIUM'));
    const hardQuestions = shuffleArray(allFormatted.filter((q) => q.difficulty === 'HARD'));

    // 3. Extragem cota prestabilită: 4 EASY, 3 MEDIUM, 3 HARD
    const selected: QuestionItem[] = [
        ...easyQuestions.slice(0, 4),
        ...mediumQuestions.slice(0, 3),
        ...hardQuestions.slice(0, 3),
    ];

    // 4. Mecanism de siguranță: dacă nu sunt suficiente întrebări pe o dificultate anume,
    // completăm până la limitCount din restul întrebărilor disponibile
    if (selected.length < limitCount) {
        const selectedIds = new Set(selected.map((q) => q.id));
        const remaining = shuffleArray(allFormatted.filter((q) => !selectedIds.has(q.id)));
        selected.push(...remaining.slice(0, limitCount - selected.length));
    }

    // 5. Amestecăm selecția finală de 10 întrebări pentru a nu apărea mereu în ordinea Easy -> Medium -> Hard
    return shuffleArray(selected).slice(0, limitCount);
}

/**
 * Calculează scorul brut, procentul și starea de promovare (minim 60%)
 */
export function calculateAssessmentScore(
    questions: QuestionItem[],
    answers: Record<number, number>
): AssessmentResult {
    let score = 0;

    questions.forEach((q) => {
        const selectedOptionId = answers[q.id];
        const correctOption = q.options.find((opt) => opt.isCorrect);
        if (correctOption && selectedOptionId === correctOption.id) {
            score += 1;
        }
    });

    const total = questions.length || 1;
    const percentage = Math.round((score / total) * 100);

    return {
        score,
        totalQuestions: questions.length,
        percentage,
        passed: percentage >= 60,
    };
}

/**
 * Salvează rezultatul evaluării în tabela assessments din Supabase
 */
export async function completeAssessmentInDb(
    assessmentId: string | number,
    scorePercentage: number
) {
    if (isNaN(Number(assessmentId))) return;

    const { error } = await supabase
        .from('assessments')
        .update({
            status: 'COMPLETED',
            total_score: scorePercentage,
            completed_at: new Date().toISOString(),
        })
        .eq('id', Number(assessmentId));

    if (error) {
        console.error('Eroare la salvarea rezultatului în Supabase:', error);
    }
}