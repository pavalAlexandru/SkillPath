import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAiQuestions } from '@/server/actions/ai-questions';
import { generateContentWithFallback } from '@/server/actions/ai-fallback';
import { createClient } from '@/server/supabase/server';

vi.mock('@/server/actions/ai-fallback', () => ({ generateContentWithFallback: vi.fn() }));
vi.mock('@/server/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const validQ = {
    question_text: 'Ce este un closure în JavaScript?',
    difficulty: 'MEDIUM', question_type: 'SINGLE',
    options: [
        { text: 'O funcție cu acces la scope-ul părinte', is_correct: true },
        { text: 'Un tip primitiv', is_correct: false },
        { text: 'O buclă', is_correct: false },
        { text: 'Un operator', is_correct: false },
    ],
};
const invalidQ = { ...validQ, options: validQ.options.slice(0, 3) }; // doar 3 opțiuni

function fakeSupabase(insertQuestion = vi.fn()) {
    return {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'mentor-1' } } }) },
        from: (table: string) => {
            if (table === 'categories') return {
                select: () => ({ in: () => Promise.resolve({ data: [{ id: 1, name: 'JS', description: null, level: 'JUNIOR' }] }) }),
            };
            if (table === 'questions') return {
                select: () => ({ eq: () => ({ limit: () => Promise.resolve({ data: [] }) }) }),
                insert: (row: unknown) => {
                    insertQuestion(row);
                    return { select: () => ({ single: () => Promise.resolve({ data: { id: 42 }, error: null }) }) };
                },
            };
            if (table === 'question_options') return { insert: () => Promise.resolve({ error: null }) };
            throw new Error('tabel neașteptat: ' + table);
        },
    };
}

describe('generateAiQuestions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('NODE_ENV', 'development');
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('respinge inputul fără categorii', async () => {
        const result = await generateAiQuestions({ categoryIds: [], count: 3 });
        expect(result).toEqual({ error: 'Alege cel puțin o categorie' });
        expect(generateContentWithFallback).not.toHaveBeenCalled();
    });

    it('inserează doar întrebările valide ca PENDING + inactive', async () => {
        const insertQuestion = vi.fn();
        (createClient as any).mockResolvedValue(fakeSupabase(insertQuestion));
        (generateContentWithFallback as any).mockResolvedValue({
            text: JSON.stringify({ questions: [validQ, invalidQ, validQ] }),
        });

        const result = await generateAiQuestions({ categoryIds: [1], count: 3 });

        expect(result).toEqual({ success: true, inserted: 2 });
        expect(insertQuestion).toHaveBeenCalledTimes(2);
        expect(insertQuestion.mock.calls[0][0]).toMatchObject({ status: 'PENDING', is_active: false, created_by: 'mentor-1', category_id: 1 });
    });

    it('cere în prompt tipul ales de mentor (MULTIPLE) și acceptă întrebări cu mai multe răspunsuri corecte', async () => {
        const insertQuestion = vi.fn();
        (createClient as any).mockResolvedValue(fakeSupabase(insertQuestion));
        const multipleQ = {
            ...validQ,
            question_type: 'MULTIPLE',
            options: validQ.options.map((o, i) => ({ ...o, is_correct: i < 2 })),
        };
        (generateContentWithFallback as any).mockResolvedValue({
            text: JSON.stringify({ questions: [multipleQ] }),
        });

        const result = await generateAiQuestions({ categoryIds: [1], count: 1, questionType: 'MULTIPLE' });

        expect(result).toEqual({ success: true, inserted: 1 });
        const prompt: string = (generateContentWithFallback as any).mock.calls[0][0];
        expect(prompt).toContain('Toate întrebările sunt de tip MULTIPLE');
        expect(insertQuestion.mock.calls[0][0]).toMatchObject({ question_type: 'MULTIPLE' });
    });

    it('fără tip explicit folosește MIXED (aleator)', async () => {
        (createClient as any).mockResolvedValue(fakeSupabase());
        (generateContentWithFallback as any).mockResolvedValue({ text: JSON.stringify({ questions: [] }) });

        await generateAiQuestions({ categoryIds: [1], count: 1 });

        const prompt: string = (generateContentWithFallback as any).mock.calls[0][0];
        expect(prompt).toContain('aleator');
    });

    it('întoarce eroare prietenoasă când AI-ul pică', async () => {
        (createClient as any).mockResolvedValue(fakeSupabase());
        (generateContentWithFallback as any).mockRejectedValue(new Error('quota'));

        const result = await generateAiQuestions({ categoryIds: [1], count: 3 });
        expect(result).toEqual({ error: 'Generarea AI a eșuat. Încearcă din nou.' });
    });
});