import { describe, it, expect } from 'vitest';
import { calculateAssessmentScore } from '@/components/assessment/AssessmentRunner';
import { QuestionItem } from '@/types/assesments';

const mockQuestions: QuestionItem[] = [
    {
        id: 1,
        categoryId: 1,
        questionText: 'Care dintre următoarele sunt limbaje orientate pe obiecte? (MULTIPLE)',
        difficulty: 'MEDIUM',
        questionType: 'MULTIPLE',
        options: [
            { id: 10, questionId: 1, optionText: 'Java', isCorrect: true },
            { id: 11, questionId: 1, optionText: 'C#', isCorrect: true },
            { id: 12, questionId: 1, optionText: 'HTML', isCorrect: false },
            { id: 13, questionId: 1, optionText: 'CSS', isCorrect: false },
        ],
    },
    {
        id: 2,
        categoryId: 1,
        questionText: 'Ce metodă HTTP trimite date noi? (SINGLE)',
        difficulty: 'EASY',
        questionType: 'SINGLE',
        options: [
            { id: 20, questionId: 2, optionText: 'GET', isCorrect: false },
            { id: 21, questionId: 2, optionText: 'POST', isCorrect: true },
            { id: 22, questionId: 2, optionText: 'DELETE', isCorrect: false },
        ],
    },
];

describe('Assessment Scoring Logic - Formula UBB', () => {
    it('calculează 100% când toate răspunsurile corecte sunt alese și niciunul greșit', () => {
        // Q1: ambele corecte (+0.5 + 0.5 = 1.0)
        // Q2: răspunsul corect (+1.0)
        const answers = {
            1: [10, 11],
            2: [21],
        };

        const result = calculateAssessmentScore(mockQuestions, answers);

        expect(result.score).toBe(2);
        expect(result.totalQuestions).toBe(2);
        expect(result.percentage).toBe(100);
        expect(result.passed).toBe(true);
    });

    it('aplică penalizare UBB la întrebare multiplă când se bifează 1 corect și 1 greșit', () => {
        // Q1: N=2 (+0.5/corect), M=2 (-0.5/greșit).
        // Selectat 10 (corect) și 12 (greșit) => 0.5 - 0.5 = 0.0 pct
        // Q2: corect 21 => 1.0 pct
        const answers = {
            1: [10, 12],
            2: [21],
        };

        const result = calculateAssessmentScore(mockQuestions, answers);

        expect(result.score).toBe(1);
        expect(result.percentage).toBe(50);
        expect(result.passed).toBe(false);
    });

    it('acordă punctaj parțial conform UBB când se bifează o singură opțiune corectă din două', () => {
        // Q1: doar 10 bifat => +0.5 pct
        // Q2: 21 bifat => +1.0 pct
        // Total: 1.5 din 2 = 75%
        const answers = {
            1: [10],
            2: [21],
        };

        const result = calculateAssessmentScore(mockQuestions, answers);

        expect(result.score).toBe(1.5);
        expect(result.percentage).toBe(75);
        expect(result.passed).toBe(true);
    });

    it('nu scade sub 0 punctajul pe o întrebare chiar dacă sunt bifate doar opțiuni greșite', () => {
        // Q1: 12 și 13 greșite => 0 - 0.5 - 0.5 = -1 => clampat la 0
        // Q2: 20 greșit => 0 pct
        const answers = {
            1: [12, 13],
            2: [20],
        };

        const result = calculateAssessmentScore(mockQuestions, answers);

        expect(result.score).toBe(0);
        expect(result.percentage).toBe(0);
        expect(result.passed).toBe(false);
    });

    it('returnează 0% și nepromovat dacă nu a fost selectat niciun răspuns', () => {
        const answers = {};
        const result = calculateAssessmentScore(mockQuestions, answers);

        expect(result.score).toBe(0);
        expect(result.percentage).toBe(0);
        expect(result.passed).toBe(false);
    });
});