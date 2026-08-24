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

export async function updateQuestion(formData: FormData) {
    const questionId = Number(formData.get('question_id'));
    const questionText = String(formData.get('question_text') ?? '').trim();
    const categoryId = Number(formData.get('category_id'));
    const difficulty = String(formData.get('difficulty') ?? 'EASY');
    const questionType = String(formData.get('question_type') ?? 'SINGLE');
    const optionsRaw = String(formData.get('options_json') ?? '[]');

    if (!questionId || questionText.length < 5) {
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

    const { error: questionError } = await supabase
        .from('questions')
        .update({
            question_text: questionText,
            category_id: categoryId,
            difficulty,
            question_type: questionType,
        })
        .eq('id', questionId);

    if (questionError) {
        console.log('EROARE UPDATE ÎNTREBARE:', questionError.message);
        return;
    }

    // Ștergem toate variantele vechi și le reintroducem pe cele noi —
    // mai simplu și mai sigur decât să potrivim variante vechi cu cele noi.
    const { error: deleteError } = await supabase
        .from('question_options')
        .delete()
        .eq('question_id', questionId);

    if (deleteError) {
        console.log('EROARE ȘTERGERE OPȚIUNI VECHI:', deleteError.message);
        return;
    }

    const { error: optionsError } = await supabase.from('question_options').insert(
        optiuniValide.map((o) => ({
            question_id: questionId,
            option_text: o.text.trim(),
            is_correct: o.correct,
        })),
    );

    if (optionsError) {
        console.log('EROARE INSERT OPȚIUNI NOI:', optionsError.message);
        return;
    }

    revalidatePath('/questions');
}

export async function toggleQuestionActive(formData: FormData) {
    const id = Number(formData.get('id'));
    const isActive = formData.get('is_active') === 'true';

    const supabase = await createClient();
    const { error } = await supabase
        .from('questions')
        .update({ is_active: !isActive })
        .eq('id', id);

    if (error) {
        console.log('EROARE TOGGLE ÎNTREBARE:', error.message);
        return;
    }

    revalidatePath('/questions');
}