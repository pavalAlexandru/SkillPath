import { createClient } from '@/server/supabase/server';
import { Card } from '@/components/ui/Card';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { AvatarUpload } from '@/components/settings/AvatarUpload';
import { ThemeToggle } from '@/components/settings/ThemeToggle';

interface ProfileData {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
}

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, avatar_url')
        .eq('id', user?.id ?? '')
        .maybeSingle<ProfileData>();

    const fullName = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim();

    return (
        <div className="min-h-screen w-full bg-slate-50 py-10 transition-colors duration-200 dark:bg-[#090d16]">
            <div className="mx-auto w-full max-w-4xl space-y-6 px-4 pb-16 sm:px-6">
                {/* Header Setări */}
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        Setări cont
                    </h1>
                    <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                        Personalizează aspectul aplicației, fotografia de profil și datele contului.
                    </p>
                </div>

                {/* 1. Aspect vizual */}
                <Card className="space-y-4 border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Aspect vizual
                        </h2>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Alege tema preferată pentru interfața SkillPath.
                        </p>
                    </div>
                    <ThemeToggle />
                </Card>

                {/* 2. Fotografie de profil */}
                <Card className="space-y-4 border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Fotografie de profil
                        </h2>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Aceasta va apărea în antetul aplicației și în activitatea ta.
                        </p>
                    </div>
                    <AvatarUpload
                        userId={user?.id ?? ''}
                        currentAvatarUrl={profile?.avatar_url ?? undefined}
                        userName={fullName}
                    />
                </Card>

                {/* 3. Formular Date Personale */}
                <Card className="border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
                    <SettingsForm
                        initialFirstName={profile?.first_name ?? ''}
                        initialLastName={profile?.last_name ?? ''}
                        email={profile?.email ?? user?.email ?? ''}
                    />
                </Card>
            </div>
        </div>
    );
}