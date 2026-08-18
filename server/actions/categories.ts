'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/server/supabase';

export async function createCategory(formData: FormData) {
    const name = String(formData.get('name') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();

    if (name.length < 2) {
        return;
    }

    const { error } = await supabase.from('categories').insert({
        name,
        description: description || null,
    });

    if (error) {
        console.log('EROARE INSERT:', error.message);
        return;
    }

    revalidatePath('/categories');
}