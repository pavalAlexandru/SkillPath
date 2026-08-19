'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/server/supabase';
import {LEVELS, type Level} from '@/lib/levels'
import {redirect} from "next/navigation";
export async function createCategory(formData: FormData) {
    const name = String(formData.get('name') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const rawLevel=String(formData.get('level') ?? 'JUNIOR').toUpperCase();

    if (name.length < 2) {
        return;
    }
    const level: Level = (LEVELS as readonly string[]).includes(rawLevel)
        ? (rawLevel as Level)
        : 'JUNIOR';


    const { error } = await supabase.from('categories').insert({
        name,
        description: description || null,
        level,
    });

    if (error) {
        console.log('EROARE INSERT:', error.message);
        return;
    }

    revalidatePath('/categories');
}
export async function updateCategory(formData: FormData) {
    const id = Number(formData.get('id'));
    const name = String(formData.get('name') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const rawLevel = String(formData.get('level') ?? 'JUNIOR').toUpperCase();

    if (!id || name.length < 2) {
        return;
    }

    const level: Level = (LEVELS as readonly string[]).includes(rawLevel)
        ? (rawLevel as Level)
        : 'JUNIOR';

    const { error } = await supabase
        .from('categories')
        .update({ name, description: description || null, level })
        .eq('id', id);

    if (error) {
        console.error('EROARE UPDATE:', error.message);
        return;
    }

    revalidatePath('/categories');
    redirect('/categories');
}