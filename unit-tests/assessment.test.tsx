import { describe, it, expect } from 'vitest';
import { calculateAssessmentScore } from '@/components/assessment/AssessmentRunner';
import { QuestionItem } from '@/types/assesments';

const testQuestions: QuestionItem[] = [
    {
        id: 1,
        categoryId: 1,
        questionText: 'Ce este polimorfismul?',
        difficulty: 'EASY',
        questionType: 'SINGLE',
        options: [
            { id: 10, questionId: 1, optionText: 'O formă multiplă de execuție', isCorrect: true },
            { id: 11, questionId: 1, optionText: 'O variabilă globală', isCorrect: false },
        ],
    },
    {
        id: 2,
        categoryId: 1,
        questionText: 'Ce metodă HTTP trimite date noi?',
        difficulty: 'EASY',
        questionType: 'SINGLE',
        options: [
            { id: 20, questionId: 2, optionText: 'GET', isCorrect: false },
            { id: 21, questionId: 2, optionText: 'POST', isCorrect: true },
        ],
    },
];

describe('Assessment Module Logic', () => {
    it('calculează corect scorul și procentajul de promovare', () => {
        const answers = { 1: 10, 2: 20 }; // 1 corect (10), 1 greșit (20)
        const result = calculateAssessmentScore(testQuestions, answers);

        expect(result.score).toBe(1);
        expect(result.totalQuestions).toBe(2);
        expect(result.percentage).toBe(50);
        expect(result.passed).toBe(false);
    });

    it('marchează testul ca promovat când scorul atinge sau depășește 60%', () => {
        const answers = { 1: 10, 2: 21 }; // ambele corecte
        const result = calculateAssessmentScore(testQuestions, answers);

        expect(result.score).toBe(2);
        expect(result.percentage).toBe(100);
        expect(result.passed).toBe(true);
    });
});