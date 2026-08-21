'use server';

import { createClient } from '@/server/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const OptionSchema = z.object({
    text: z.string().min(1, 'Textul opțiunii este obligatoriu'),
    isCorrect: z.boolean()
});

const ProposeQuestionSchema = z.object({
    categoryId: z.number().positive('Categoria este obligatorie'),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    questionType: z.enum(['SINGLE', 'MULTIPLE']),
    questionText: z.string().min(5, 'Enunțul trebuie să aibă minim 5 caractere'),
    options: z.array(OptionSchema).length(4, 'Sunt necesare exact 4 opțiuni')
}).refine(data => {
    const correctOptionsCount = data.options.filter(o => o.isCorrect).length;
    if (data.questionType === 'SINGLE') {
        return correctOptionsCount === 1;
    }
    return correctOptionsCount >= 1;
}, {
    message: 'Întrebările de tip SINGLE trebuie să aibă o singură opțiune corectă. Cele de tip MULTIPLE trebuie să aibă cel puțin una.'
});

export async function proposeQuestionAction(data: unknown) {
    try {
        const validatedData = ProposeQuestionSchema.parse(data);

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Neautentificat' };
        }

        // Insert question
        const { data: questionData, error: questionError } = await supabase.from('questions').insert({
            category_id: validatedData.categoryId,
            question_text: validatedData.questionText,
            difficulty: validatedData.difficulty,
            question_type: validatedData.questionType,
            status: 'PENDING',
            is_active: false,
            created_by: user.id
        }).select('id').single();

        if (questionError || !questionData) {
            console.error('Eroare la inserarea întrebării:', questionError);
            return { error: questionError?.message || 'Eroare la salvarea întrebării.' };
        }

        const questionId = questionData.id;

        // Insert options
        const optionsToInsert = validatedData.options.map(opt => ({
            question_id: questionId,
            option_text: opt.text,
            is_correct: opt.isCorrect
        }));

        const { error: optionsError } = await supabase.from('question_options').insert(optionsToInsert);

        if (optionsError) {
            console.error('Eroare la inserarea opțiunilor:', optionsError);
            return { error: optionsError.message || 'Eroare la salvarea opțiunilor.' };
        }

        revalidatePath('/dashboard');
        revalidatePath('/proposals');
        
        return { success: true };
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return { error: err.issues[0].message };
        }
        return { error: 'Eroare internă de server.' };
    }
}
