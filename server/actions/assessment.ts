'use server';

import { createClient } from '../supabase/server';

export async function completeAssessmentAction(
    assessmentId: string | number,
    scorePercentage: number
) {
    if (isNaN(Number(assessmentId))) return;

    const supabase = await createClient();

    const { error } = await supabase
        .from('assessments')
        .update({
            status: 'COMPLETED',
            total_score: scorePercentage,
            completed_at: new Date().toISOString(),
        })
        .eq('id', Number(assessmentId));

    if (error) {
        console.error('Eroare la salvarea rezultatului în Supabase:', error);
    }
}