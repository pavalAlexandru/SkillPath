import { Tables } from '@/server/supabase/database.types';

export type QuestionRow = Tables<'questions'>;
export type OptionRow = Tables<'question_options'>;
export type CategoryRow = Tables<'categories'>;

// 2. Tipurile de bază derivate
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionType = 'SINGLE' | 'MULTIPLE';

// 3. Opțiunea adaptată pentru UI
export interface QuestionOption {
    id: OptionRow['id'];
    questionId: OptionRow['question_id'];
    optionText: OptionRow['option_text'];
    isCorrect?: OptionRow['is_correct'];
}

// 4. Întrebarea completă (cu opțiunile imbricate)
export interface QuestionItem {
    id: QuestionRow['id'];
    categoryId: QuestionRow['category_id'];
    questionText: QuestionRow['question_text'];
    difficulty: QuestionRow['difficulty'];
    questionType: QuestionRow['question_type'];
    options: QuestionOption[];
}

// 5. Rezultatul final calculat după test
export interface AssessmentResult {
    score: number;
    totalQuestions: number;
    percentage: number;
    passed: boolean;
}