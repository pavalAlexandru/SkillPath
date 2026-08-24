'use server';

import { createClient } from '@/server/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approveProposalAction(formData: FormData): Promise<void> {
    const questionId = Number(formData.get('questionId'));
    if (!questionId) return;

    const supabase = await createClient();
    
    const { error } = await supabase
        .from('questions')
        .update({ status: 'APPROVED', is_active: true })
        .eq('id', questionId);

    if (error) {
        console.error('Error approving proposal:', error);
    }
    
    revalidatePath('/proposals');
}

export async function rejectProposalAction(formData: FormData): Promise<void> {
    const questionId = Number(formData.get('questionId'));
    if (!questionId) return;

    const supabase = await createClient();
    
    // We should delete options first if no cascade is set
    const { error: optionsError } = await supabase
        .from('question_options')
        .delete()
        .eq('question_id', questionId);
        
    if (optionsError) {
        console.error('Error deleting proposal options:', optionsError);
    }

    const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

    if (error) {
        console.error('Error deleting proposal:', error);
    }
    
    revalidatePath('/proposals');
}
