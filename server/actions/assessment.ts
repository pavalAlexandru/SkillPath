'use server';

import { saveCompletedAssessment } from '@/server/supabase/assessmentService';
import { QuestionItem } from '@/types/assesments';
import { revalidatePath } from 'next/cache';

export async function completeAssessmentAction(
    assessmentId: string | number,
    scorePercentage: number,
    answers: Record<number, number[]>,
    questions: QuestionItem[]
) {
    try {
        await saveCompletedAssessment(assessmentId, scorePercentage, answers, questions);
        revalidatePath('/assessment');
        revalidatePath('/dashboard');
    } catch (error) {
        console.error('Eroare la finalizarea evaluării:', error);
    }
}