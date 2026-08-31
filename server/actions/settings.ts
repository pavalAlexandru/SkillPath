
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/server/supabase/server';

const UpdateNameSchema = z.object({
    firstName: z.string().trim().min(2, 'Prenumele trebuie să aibă minim 2 caractere'),
    lastName: z.string().trim().min(2, 'Numele trebuie să aibă minim 2 caractere'),
});

export async function updateNameAction(data: unknown) {
    try {
        const { firstName, lastName } = UpdateNameSchema.parse(data);

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Neautentificat' };
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                first_name: firstName,
                last_name: lastName,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (error) {
            console.error('Eroare la actualizarea numelui:', error);
            return { error: error.message || 'Eroare la salvarea datelor.' };
        }

        revalidatePath('/settings');
        return { success: true };
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return { error: err.issues[0].message };
        }
        return { error: 'Eroare internă de server.' };
    }
}

const ChangePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Introdu parola curentă'),
        newPassword: z.string().min(6, 'Parola nouă trebuie să aibă minim 6 caractere'),
        confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: 'Parolele nu coincid',
    })
    .refine((d) => d.newPassword !== d.currentPassword, {
        message: 'Parola nouă trebuie să fie diferită de cea curentă',
    });

export async function changePasswordAction(data: unknown) {
    try {
        const { currentPassword, newPassword } = ChangePasswordSchema.parse(data);

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.email) {
            return { error: 'Neautentificat' };
        }

        // Confirmăm identitatea înainte de schimbare.
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });

        if (signInError) {
            return { error: 'Parola curentă este greșită.' };
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            console.error('Eroare la schimbarea parolei:', error);
            return { error: error.message || 'Eroare la schimbarea parolei.' };
        }

        return { success: true };
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return { error: err.issues[0].message };
        }
        return { error: 'Eroare internă de server.' };
    }
}
