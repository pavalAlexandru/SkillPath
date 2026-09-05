import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAiQuestions } from '@/server/actions/ai-questions';
import { generateContentWithFallback } from '@/server/actions/ai-fallback';
import { createClient } from '@/server/supabase/server';
import { aiConfig } from '@/config/aiConfig';

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

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;
type AiResponse = Awaited<ReturnType<typeof generateContentWithFallback>>;

const mockedCreateClient = vi.mocked(createClient);
const mockedAi = vi.mocked(generateContentWithFallback);

// Răspunsul AI-ului, ca text JSON
function mockAiText(payload: unknown) {
    mockedAi.mockResolvedValue({ text: JSON.stringify(payload) } as AiResponse);
}
function promptTrimis(): string {
    return mockedAi.mock.calls[0][0];
}

// generateAzi = câte întrebări a creat deja mentorul în ultimele 24h (pentru limita zilnică)
function fakeSupabase(insertQuestion = vi.fn(), generateAzi = 0): SupabaseClient {
    return {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'mentor-1' } } }) },
        from: (table: string) => {
            if (table === 'categories') return {
                select: () => ({ in: () => Promise.resolve({ data: [{ id: 1, name: 'JS', description: null, level: 'JUNIOR' }] }) }),
            };
            if (table === 'questions') return {
                select: () => ({
                    eq: () => ({
                        limit: () => Promise.resolve({ data: [] }),
                        gte: () => Promise.resolve({ count: generateAzi }),
                    }),
                }),
                insert: (row: unknown) => {
                    insertQuestion(row);
                    return { select: () => ({ single: () => Promise.resolve({ data: { id: 42 }, error: null }) }) };
                },
            };
            if (table === 'question_options') return { insert: () => Promise.resolve({ error: null }) };
            throw new Error('tabel neașteptat: ' + table);
        },
    } as unknown as SupabaseClient;
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
        mockedCreateClient.mockResolvedValue(fakeSupabase(insertQuestion));
        mockAiText({ questions: [validQ, invalidQ, validQ] });

        const result = await generateAiQuestions({ categoryIds: [1], count: 3 });

        expect(result).toEqual({ success: true, inserted: 2 });
        expect(insertQuestion).toHaveBeenCalledTimes(2);
        expect(insertQuestion.mock.calls[0][0]).toMatchObject({ status: 'PENDING', is_active: false, created_by: 'mentor-1', category_id: 1 });
    });

    it('cere în prompt tipul ales de mentor (MULTIPLE) și acceptă întrebări cu mai multe răspunsuri corecte', async () => {
        const insertQuestion = vi.fn();
        mockedCreateClient.mockResolvedValue(fakeSupabase(insertQuestion));
        const multipleQ = {
            ...validQ,
            question_type: 'MULTIPLE',
            options: validQ.options.map((o, i) => ({ ...o, is_correct: i < 2 })),
        };
        mockAiText({ questions: [multipleQ] });

        const result = await generateAiQuestions({ categoryIds: [1], count: 1, questionType: 'MULTIPLE' });

        expect(result).toEqual({ success: true, inserted: 1 });
        const prompt = promptTrimis();
        expect(prompt).toContain('Toate întrebările sunt de tip MULTIPLE');
        expect(insertQuestion.mock.calls[0][0]).toMatchObject({ question_type: 'MULTIPLE' });
    });

    it('fără tip explicit folosește MIXED (aleator)', async () => {
        mockedCreateClient.mockResolvedValue(fakeSupabase());
        mockAiText({ questions: [] });

        await generateAiQuestions({ categoryIds: [1], count: 1 });

        const prompt = promptTrimis();
        expect(prompt).toContain('aleator');
    });

    it('cere în prompt dificultatea aleasă (HARD) și o impune la inserare chiar dacă AI-ul a marcat altfel', async () => {
        const insertQuestion = vi.fn();
        mockedCreateClient.mockResolvedValue(fakeSupabase(insertQuestion));
        mockAiText({ questions: [{ ...validQ, difficulty: 'EASY' }] });

        const result = await generateAiQuestions({ categoryIds: [1], count: 1, difficulty: 'HARD' });

        expect(result).toEqual({ success: true, inserted: 1 });
        const prompt = promptTrimis();
        expect(prompt).toContain('Toate întrebările au dificultatea HARD');
        expect(insertQuestion.mock.calls[0][0]).toMatchObject({ difficulty: 'HARD' });
    });

    it('fără dificultate explicită lasă AI-ul să amestece și păstrează dificultatea marcată de el', async () => {
        const insertQuestion = vi.fn();
        mockedCreateClient.mockResolvedValue(fakeSupabase(insertQuestion));
        mockAiText({ questions: [validQ] });

        await generateAiQuestions({ categoryIds: [1], count: 1 });

        const prompt = promptTrimis();
        expect(prompt).toContain('amestecă dificultățile');
        expect(insertQuestion.mock.calls[0][0]).toMatchObject({ difficulty: 'MEDIUM' });
    });

    it('refuză generarea când mentorul a atins limita zilnică și nu mai cheamă AI-ul', async () => {
        mockedCreateClient.mockResolvedValue(fakeSupabase(vi.fn(), aiConfig.dailyGenerationLimitPerMentor));

        const result = await generateAiQuestions({ categoryIds: [1], count: 1 });

        expect(result).toEqual({ error: `Ai atins limita de ${aiConfig.dailyGenerationLimitPerMentor} întrebări generate pe zi. Încearcă din nou mâine.` });
        expect(mockedAi).not.toHaveBeenCalled();
    });

    it('refuză un lot mai mare decât ce a mai rămas din limita zilnică', async () => {
        mockedCreateClient.mockResolvedValue(fakeSupabase(vi.fn(), aiConfig.dailyGenerationLimitPerMentor - 2));

        const result = await generateAiQuestions({ categoryIds: [1], count: 3 });

        expect(result).toEqual({ error: 'Mai poți genera 2 întrebări azi. Alege un număr mai mic.' });
        expect(mockedAi).not.toHaveBeenCalled();
    });

    it('întoarce eroare prietenoasă când AI-ul pică', async () => {
        mockedCreateClient.mockResolvedValue(fakeSupabase());
        mockedAi.mockRejectedValue(new Error('quota'));

        const result = await generateAiQuestions({ categoryIds: [1], count: 3 });
        expect(result).toEqual({ error: 'Generarea AI a eșuat. Încearcă din nou.' });
    });
});