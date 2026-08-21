import { createClient } from './server';
import { StudentLevel } from '@/types/assesments';

export async function getCategoriesByLevel(level: StudentLevel) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('categories')
        .select('id, name, description, level')
        .eq('level', level)
        .eq('is_active', true)
        .order('id', { ascending: true });

    if (error || !data) {
        console.error(`Eroare la preluarea categoriilor pentru ${level}:`, error);
        return [];
    }

    return data;
}