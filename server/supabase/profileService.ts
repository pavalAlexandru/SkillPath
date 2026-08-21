import { createClient } from './server';
import { StudentLevel } from '@/types/assesments';

export async function getCurrentStudentLevel(): Promise<StudentLevel> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return 'JUNIOR';

    const { data: studentProfile, error } = await supabase
        .from('student_profiles')
        .select('current_level')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error || !studentProfile || !studentProfile.current_level) {
        return 'JUNIOR';
    }

    return studentProfile.current_level as StudentLevel;
}