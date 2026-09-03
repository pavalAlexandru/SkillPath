'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Type, Schema } from '@google/genai';
import { createClient } from '@/server/supabase/server';
import { generateContentWithFallback } from './ai-fallback';
import { LEVEL_LABEL, type Level } from '@/lib/levels';

export type GenerateAiQuestionsResult =
    | { success: true; inserted: number }
    | { error: string };


const InputSchema = z.object({
    categoryIds: z.array(z.number().positive()).min(1, 'Alege cel puțin o categorie'),
    count: z.number().int().min(1).max(5, 'Maxim 5 întrebări per categorie'),
    // MIXED = AI-ul alege aleator între SINGLE și MULTIPLE pentru fiecare întrebare
    questionType: z.enum(['MIXED', 'SINGLE', 'MULTIPLE']).default('MIXED'),
});

export type AiQuestionType = z.infer<typeof InputSchema>['questionType'];

const REGULA_TIP: Record<AiQuestionType, string> = {
    MIXED: 'Alege tu tipul pentru fiecare întrebare, aleator: aproximativ jumătate SINGLE (exact o variantă corectă) și jumătate MULTIPLE (2-3 variante corecte).',
    SINGLE: 'Toate întrebările sunt de tip SINGLE: exact o variantă corectă.',
    MULTIPLE: 'Toate întrebările sunt de tip MULTIPLE: 2-3 variante corecte din 4.',
};

// Ce acceptăm de la AI (aceleași reguli ca la propunerile studenților)
const AiQuestionSchema = z.object({
    question_text: z.string().min(5),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    question_type: z.enum(['SINGLE', 'MULTIPLE']),
    options: z.array(z.object({ text: z.string().min(1), is_correct: z.boolean() })).length(4),
}).refine((q) => {
    const corecte = q.options.filter((o) => o.is_correct).length;
    return q.question_type === 'SINGLE' ? corecte === 1 : corecte >= 1;
});

const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question_text: { type: Type.STRING },
                    difficulty: { type: Type.STRING, enum: ['EASY', 'MEDIUM', 'HARD'] },
                    question_type: { type: Type.STRING, enum: ['SINGLE', 'MULTIPLE'] },
                    options: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING },
                                is_correct: { type: Type.BOOLEAN },
                            },
                            required: ['text', 'is_correct'],
                        },
                    },
                },
                required: ['question_text', 'difficulty', 'question_type', 'options'],
            },
        },
    },
    required: ['questions'],
};

export async function generateAiQuestions(input: unknown): Promise<GenerateAiQuestionsResult> {
    try {
        const { categoryIds, count, questionType } = InputSchema.parse(input);

        // --- E2E Mocking Fallback (același pattern ca în ai-recommendations.ts) ---
        let isE2E = false;
        try {
            const { headers } = await import('next/headers');
            isE2E = (await headers()).get('x-e2e-test') === 'true';
        } catch {}
        if (isE2E || process.env.NODE_ENV === 'test') {
            return { success: true, inserted: count * categoryIds.length };
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'Neautentificat' };

        const { data: categories } = await supabase
            .from('categories')
            .select('id, name, description, level')
            .in('id', categoryIds);
        if (!categories || categories.length === 0) return { error: 'Categoriile nu au fost găsite.' };

        let inserted = 0;

        for (const cat of categories) {
            const { data: existing } = await supabase
                .from('questions')
                .select('question_text')
                .eq('category_id', cat.id)
                .limit(50);
            const existingTexts = (existing ?? []).map((q) => q.question_text);

            const prompt = buildPrompt(cat, count, questionType, existingTexts);

            const response = await generateContentWithFallback(prompt, {
                responseMimeType: 'application/json',
                responseSchema,
            });

            const parsed = JSON.parse(response.text || '{}');
            const rawQuestions: unknown[] = Array.isArray(parsed.questions) ? parsed.questions : [];

            for (const raw of rawQuestions) {
                const result = AiQuestionSchema.safeParse(raw);
                if (!result.success) continue; // sărim peste ce a ieșit strâmb, nu blocăm tot lotul

                const q = result.data;
                const { data: qRow, error: qErr } = await supabase
                    .from('questions')
                    .insert({
                        category_id: cat.id,
                        question_text: q.question_text,
                        difficulty: q.difficulty,
                        question_type: q.question_type,
                        status: 'PENDING',
                        is_active: false,
                        created_by: user.id,
                    })
                    .select('id')
                    .single();
                if (qErr || !qRow) { console.error('AI question insert:', qErr); continue; }

                const { error: oErr } = await supabase.from('question_options').insert(
                    q.options.map((o) => ({ question_id: qRow.id, option_text: o.text, is_correct: o.is_correct })),
                );
                if (oErr) { console.error('AI options insert:', oErr); continue; }

                inserted++;
            }
        }

        revalidatePath('/proposals');
        return { success: true, inserted };
    } catch (err) {
        if (err instanceof z.ZodError) return { error: err.issues[0].message };
        console.error('generateAiQuestions:', err);
        return { error: 'Generarea AI a eșuat. Încearcă din nou.' };
    }
}

function buildPrompt(
    cat: { name: string; description: string | null; level: string },
    count: number,
    questionType: AiQuestionType,
    existingTexts: string[],
) {
    const levelLabel = LEVEL_LABEL[cat.level as Level] ?? cat.level;
    return `
Ești un mentor tehnic care creează întrebări grilă pentru o platformă de evaluare a programatorilor.

Categorie: ${cat.name}
Descriere: ${cat.description ?? '(fără descriere)'}
Nivel țintă: ${levelLabel}

Generează exact ${count} întrebări NOI în limba română, pentru această categorie și acest nivel.
Reguli:
1. Fiecare întrebare are exact 4 variante de răspuns.
2. Alege tu dificultatea (EASY / MEDIUM / HARD) potrivită enunțului; amestecă dificultățile.
3. ${REGULA_TIP[questionType]}
4. Variantele greșite trebuie să fie plauzibile, nu evidente.
5. Nu repeta și nu reformula întrebările existente de mai jos.

Întrebări existente (de evitat):
${existingTexts.length ? existingTexts.map((t) => `- ${t}`).join('\n') : '- (niciuna)'}
`;
}