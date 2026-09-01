import { createClient } from '@/server/supabase/server';
import { Card } from '@/components/ui/Card';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { AvatarUpload } from '@/components/settings/AvatarUpload';

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await (supabase.from('profiles') as any)
        .select('id, first_name, last_name, email, avatar_url')
        .eq('id', user?.id ?? '')
        .maybeSingle();

    const fullName = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim();

    return (
        <div className="mx-auto w-full max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Setări cont</h1>
                <p className="text-sm text-slate-500">
                    Actualizează-ți fotografia de profil, datele personale sau parola.
                </p>
            </div>

            {/* Secțiune Schimbare Fotografie */}
            <Card className="space-y-4">
                <div>
                    <h2 className="text-base font-bold text-slate-900">Fotografie de profil</h2>
                    <p className="text-xs text-slate-500">
                        Aceasta va apărea în antetul aplicației și în activitatea ta.
                    </p>
                </div>
                <AvatarUpload
                    userId={user?.id ?? ''}
                    currentAvatarUrl={profile?.avatar_url}
                    userName={fullName}
                />
            </Card>

            {/* Formular Date Personale */}
            <SettingsForm
                initialFirstName={profile?.first_name ?? ''}
                initialLastName={profile?.last_name ?? ''}
                email={profile?.email ?? user?.email ?? ''}
            />
        </div>
    );
}