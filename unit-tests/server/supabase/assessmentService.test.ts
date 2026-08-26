import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    saveCompletedAssessment,
    getUserCategoryProgress,
} from '@/server/supabase/assessmentService';
import { createClient } from '@/server/supabase/server';
import { getCurrentStudentLevel } from '@/server/supabase/profileService';
import { getCategoriesByLevel } from '@/server/supabase/categoryService';
import { QuestionItem } from '@/types/assesments';

vi.mock('@/server/supabase/server');
vi.mock('@/server/supabase/profileService');
vi.mock('@/server/supabase/categoryService');

type MockChain = {
    auth: {
        getUser: ReturnType<typeof vi.fn>;
    };
    from: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    in: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
};

describe('assessmentService - Persistence & Level Up Engine', () => {
    let mockSupabase: MockChain;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: 'test-user-id' } },
                }),
            },
            from: vi.fn(),
            insert: vi.fn(),
            select: vi.fn(),
            single: vi.fn(),
            maybeSingle: vi.fn(),
            update: vi.fn(),
            eq: vi.fn(),
            in: vi.fn(),
            order: vi.fn(),
        };

        mockSupabase.from.mockReturnValue(mockSupabase);
        mockSupabase.insert.mockReturnValue(mockSupabase);
        mockSupabase.select.mockReturnValue(mockSupabase);
        mockSupabase.update.mockReturnValue(mockSupabase);
        mockSupabase.eq.mockReturnValue(mockSupabase);
        mockSupabase.in.mockReturnValue(mockSupabase);
        mockSupabase.order.mockReturnValue(mockSupabase);
        mockSupabase.maybeSingle.mockResolvedValue({ data: { current_level: 'JUNIOR' }, error: null });

        vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);
    });

    it('salvează cu succes sesiunea de test și răspunsurile în baza de date', async () => {
        vi.mocked(getCurrentStudentLevel).mockResolvedValue('JUNIOR');
        vi.mocked(getCategoriesByLevel).mockResolvedValue([]);

        mockSupabase.single
            .mockResolvedValueOnce({ data: { id: 101 }, error: null }) // assessments insert
            .mockResolvedValueOnce({ data: { id: 501 }, error: null }); // assessment_questions insert

        const mockQuestions: QuestionItem[] = [
            {
                id: 1,
                categoryId: 5,
                questionText: 'Sample Q',
                difficulty: 'EASY',
                questionType: 'SINGLE',
                options: [{ id: 10, questionId: 1, optionText: 'Opt 1', isCorrect: true }],
            },
        ];

        const assessmentId = await saveCompletedAssessment(5, 100, { 1: [10] }, mockQuestions);

        expect(assessmentId).toBe(101);
        expect(mockSupabase.from).toHaveBeenCalledWith('assessments');
        expect(mockSupabase.from).toHaveBeenCalledWith('assessment_questions');
        expect(mockSupabase.from).toHaveBeenCalledWith('assessment_answers');
        expect(mockSupabase.from).toHaveBeenCalledWith('assessment_category_scores');
    });

    it('declanșează Level-Up de la JUNIOR la MIDDLE când toate categoriile nivelului au minim 90%', async () => {
        vi.mocked(getCurrentStudentLevel).mockResolvedValue('JUNIOR');
        vi.mocked(getCategoriesByLevel).mockResolvedValue([
            { id: 1, name: 'OOP', description: '', level: 'JUNIOR' },
            { id: 2, name: 'Git', description: '', level: 'JUNIOR' },
        ]);

        mockSupabase.single
            .mockResolvedValueOnce({ data: { id: 200 }, error: null })
            .mockResolvedValueOnce({ data: { id: 600 }, error: null });

        mockSupabase.in.mockResolvedValueOnce({
            data: [
                { category_id: 1, score_percentage: 95 },
                { category_id: 2, score_percentage: 90 },
            ],
            error: null,
        });

        const mockQuestions: QuestionItem[] = [
            {
                id: 1,
                categoryId: 1,
                questionText: 'Test',
                difficulty: 'EASY',
                questionType: 'SINGLE',
                options: [{ id: 10, questionId: 1, optionText: 'A', isCorrect: true }],
            },
        ];

        await saveCompletedAssessment(1, 95, { 1: [10] }, mockQuestions);

        expect(mockSupabase.from).toHaveBeenCalledWith('student_profiles');
        expect(mockSupabase.update).toHaveBeenCalledWith(
            expect.objectContaining({ current_level: 'MIDDLE' })
        );
    });

    it('NU declanșează Level-Up dacă cel puțin o categorie este sub 90%', async () => {
        vi.mocked(getCurrentStudentLevel).mockResolvedValue('JUNIOR');
        vi.mocked(getCategoriesByLevel).mockResolvedValue([
            { id: 1, name: 'OOP', description: '', level: 'JUNIOR' },
            { id: 2, name: 'Git', description: '', level: 'JUNIOR' },
        ]);

        mockSupabase.single
            .mockResolvedValueOnce({ data: { id: 200 }, error: null })
            .mockResolvedValueOnce({ data: { id: 600 }, error: null });

        mockSupabase.in.mockResolvedValueOnce({
            data: [
                { category_id: 1, score_percentage: 100 },
                { category_id: 2, score_percentage: 75 },
            ],
            error: null,
        });

        const mockQuestions: QuestionItem[] = [
            {
                id: 1,
                categoryId: 1,
                questionText: 'Test',
                difficulty: 'EASY',
                questionType: 'SINGLE',
                options: [{ id: 10, questionId: 1, optionText: 'A', isCorrect: true }],
            },
        ];

        await saveCompletedAssessment(1, 100, { 1: [10] }, mockQuestions);

        expect(mockSupabase.update).not.toHaveBeenCalled();
    });

    it('preia corect cel mai recent scor per categorie din istoricul utilizatorului', async () => {
        mockSupabase.order.mockResolvedValueOnce({
            data: [
                {
                    category_id: 1,
                    score_percentage: 85,
                    assessments: { completed_at: '2026-08-21T10:00:00Z' },
                },
                {
                    category_id: 2,
                    score_percentage: 45,
                    assessments: { completed_at: '2026-08-21T09:00:00Z' },
                },
            ],
            error: null,
        });

        const progress = await getUserCategoryProgress();

        expect(progress[1]).toEqual({
            categoryId: 1,
            lastScore: 85,
            passed: true,
            completedAt: '2026-08-21T10:00:00Z',
        });
        expect(progress[2]).toEqual({
            categoryId: 2,
            lastScore: 45,
            passed: false,
            completedAt: '2026-08-21T09:00:00Z',
        });
    });
});