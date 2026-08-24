'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/server/supabase/server';

export async function toggleStudentActive(formData: FormData) {
    const id = String(formData.get('id') ?? '');
    const isActive = formData.get('is_active') === 'true';

    if (!id) {
        return;
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from('profiles')
        .update({ is_active: !isActive })
        .eq('id', id);

    if (error) {
        console.log('EROARE TOGGLE STUDENT:', error.message);
        return;
    }

    revalidatePath('/students');
}

export async function promoteToMentor(formData: FormData) {
    const id = String(formData.get('id') ?? '');

    if (!id) {
        return;
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from('profiles')
        .update({ role: 'MENTOR' })
        .eq('id', id);

    if (error) {
        console.log('EROARE PROMOVARE:', error.message);
        return;
    }

    revalidatePath('/students');
}
