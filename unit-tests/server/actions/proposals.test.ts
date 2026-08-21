import { describe, it, expect, vi, beforeEach } from 'vitest';
import { proposeQuestionAction } from '@/server/actions/proposals';
import { z } from 'zod';

const mocks = vi.hoisted(() => ({
    getUserMock: vi.fn(),
    fromMock: vi.fn(),
    insertMock: vi.fn(),
    selectMock: vi.fn(),
    singleMock: vi.fn(),
    revalidatePathMock: vi.fn(),
}));

vi.mock('@/server/supabase/server', () => ({
    createClient: () => ({
        auth: {
            getUser: mocks.getUserMock,
        },
        from: mocks.fromMock,
    })
}));

vi.mock('next/cache', () => ({
    revalidatePath: mocks.revalidatePathMock,
}));

describe('proposeQuestionAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        mocks.fromMock.mockReturnValue({
            insert: mocks.insertMock,
        });
        
        mocks.insertMock.mockReturnValue({
            select: mocks.selectMock,
        });

        mocks.selectMock.mockReturnValue({
            single: mocks.singleMock,
        });
    });

    const validPayload = {
        categoryId: 1,
        difficulty: 'EASY',
        questionType: 'SINGLE',
        questionText: 'This is a valid test question with more than 5 chars.',
        options: [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: false },
            { text: 'C', isCorrect: false },
            { text: 'D', isCorrect: false }
        ]
    };

    it('returns error if user is not authenticated', async () => {
        mocks.getUserMock.mockResolvedValue({ data: { user: null } });

        const result = await proposeQuestionAction(validPayload);
        expect(result).toEqual({ error: 'Neautentificat' });
    });

    it('returns zod error if payload is invalid (e.g. less than 4 options)', async () => {
        const invalidPayload = { ...validPayload, options: validPayload.options.slice(0, 2) };
        const result = await proposeQuestionAction(invalidPayload);
        expect(result.error).toContain('Sunt necesare exact 4 opțiuni');
    });

    it('returns zod error if questionText is too short', async () => {
        const invalidPayload = { ...validPayload, questionText: 'abc' };
        const result = await proposeQuestionAction(invalidPayload);
        expect(result.error).toContain('Enunțul trebuie să aibă minim 5 caractere');
    });

    it('successfully proposes a question when payload is valid and authenticated', async () => {
        mocks.getUserMock.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
        mocks.singleMock.mockResolvedValue({ data: { id: 42 }, error: null });
        mocks.insertMock.mockImplementation((payload) => {
            if (Array.isArray(payload)) {
                return Promise.resolve({ error: null }); // for question_options
            }
            return { select: mocks.selectMock }; // for questions
        });

        const result = await proposeQuestionAction(validPayload);
        expect(result).toEqual({ success: true });
        
        expect(mocks.fromMock).toHaveBeenCalledWith('questions');
        expect(mocks.fromMock).toHaveBeenCalledWith('question_options');
        expect(mocks.revalidatePathMock).toHaveBeenCalledWith('/dashboard');
        expect(mocks.revalidatePathMock).toHaveBeenCalledWith('/proposals');
    });

    it('returns error if question insert fails', async () => {
        mocks.getUserMock.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
        mocks.singleMock.mockResolvedValue({ data: null, error: { message: 'DB error' } });
        
        const result = await proposeQuestionAction(validPayload);
        expect(result).toEqual({ error: 'DB error' });
    });
});
