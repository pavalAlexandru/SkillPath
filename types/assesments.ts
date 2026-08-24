import { Tables } from '@/server/supabase/database.types';

export type QuestionRow = Tables<'questions'>;
export type OptionRow = Tables<'question_options'>;
export type CategoryRow = Tables<'categories'>;

// 1. Tipurile de Nivel conform bazei de date
export type StudentLevel = 'JUNIOR' | 'MIDDLE' | 'SENIOR';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionType = 'SINGLE' | 'MULTIPLE';

// 2. Opțiunea adaptată pentru UI
export interface QuestionOption {
    id: OptionRow['id'];
    questionId: OptionRow['question_id'];
    optionText: OptionRow['option_text'];
    isCorrect?: OptionRow['is_correct'];
}

// 3. Întrebarea completă (cu opțiunile imbricate și denumirea categoriei)
export interface QuestionItem {
    id: QuestionRow['id'];
    categoryId: QuestionRow['category_id'];
    categoryName?: string;
    questionText: QuestionRow['question_text'];
    difficulty: QuestionRow['difficulty'];
    questionType: QuestionRow['question_type'];
    options: QuestionOption[];
}

// 4. Rezultatul final calculat după evaluare
export interface AssessmentResult {
    score: number;
    totalQuestions: number;
    percentage: number;
    passed: boolean;
    newId?: number;
}