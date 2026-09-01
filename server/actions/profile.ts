'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/server/supabase/server';

export async function updateAvatarUrl(avatarUrl: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Neautorizat' };
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
        } as any)
        .eq('id', user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return { success: true };
}