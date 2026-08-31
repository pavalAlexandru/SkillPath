import { createClient } from '@/server/supabase/server';
import { SettingsForm } from '@/components/settings/SettingsForm';

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user?.id ?? '')
        .maybeSingle();

    return (
        <div className="mx-auto w-full max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Setări cont</h1>
                <p className="text-sm text-slate-500">
                    Actualizează-ți datele personale, parola sau dezactivează contul.
                </p>
            </div>

            <SettingsForm
                initialFirstName={profile?.first_name ?? ''}
                initialLastName={profile?.last_name ?? ''}
                email={profile?.email ?? user?.email ?? ''}
            />
        </div>
    );
}