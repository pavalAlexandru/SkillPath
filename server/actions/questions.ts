'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/server/supabase/server';

export async function createQuestion(formData: FormData) {
    const questionText = String(formData.get('question_text') ?? '').trim();
    const categoryId = Number(formData.get('category_id'));
    const difficulty = String(formData.get('difficulty') ?? 'EASY');
    const questionType = String(formData.get('question_type') ?? 'SINGLE');
    const optionsRaw = String(formData.get('options_json') ?? '[]');

    if (questionText.length < 5) {
        return;
    }

    let options: { text: string; correct: boolean }[];
    try {
        options = JSON.parse(optionsRaw);
    } catch {
        return;
    }

    const optiuniValide = options.filter((o) => o.text.trim().length > 0);
    const numarCorecte = optiuniValide.filter((o) => o.correct).length;

    if (optiuniValide.length < 2 || numarCorecte === 0) {
        return;
    }

    if (questionType === 'SINGLE' && numarCorecte !== 1) {
        return;
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: question, error: questionError } = await supabase
        .from('questions')
        .insert({
            question_text: questionText,
            category_id: categoryId,
            difficulty,
            question_type: questionType,
            created_by: user?.id ?? null,
        })
        .select()
        .single();

    if (questionError || !question) {
        console.log('EROARE INSERT ÎNTREBARE:', questionError?.message);
        return;
    }

    const { error: optionsError } = await supabase.from('question_options').insert(
        optiuniValide.map((o) => ({
            question_id: question.id,
            option_text: o.text.trim(),
            is_correct: o.correct,
        })),
    );

    if (optionsError) {
        console.log('EROARE INSERT OPȚIUNI:', optionsError.message);
        return;
    }

    revalidatePath('/questions');
}