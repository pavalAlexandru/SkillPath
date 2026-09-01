import React from 'react';
import { createClient } from '@/server/supabase/server';
import { Navbar } from '@/components/shared/Navbar';
import { StudentNavigation } from '@/components/shared/StudentNavigation';
import { mentorNavItems } from '@/lib/navigation';

interface UserProfile {
    role: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
}

export default async function SettingsLayout({
                                                 children,
                                             }: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data } = await supabase
        .from('profiles')
        .select('role, first_name, last_name, avatar_url')
        .eq('id', user?.id ?? '')
        .maybeSingle();

    const profile = data as unknown as UserProfile | null;

    const isMentor = profile?.role?.trim().toLowerCase() === 'mentor';
    const userEmail = user?.email || 'Nespecificat';
    const userName = profile
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
        : '';
    const avatarUrl = profile?.avatar_url ?? null;

    return (
        <div className="min-h-screen w-full flex flex-col bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#090d16] dark:text-slate-100">
            {isMentor ? (
                <Navbar
                    roleBadge="MENTOR"
                    userName={userName}
                    userEmail={userEmail}
                    avatarUrl={avatarUrl}
                    items={mentorNavItems}
                />
            ) : (
                <StudentNavigation
                    userName={userName}
                    userEmail={userEmail}
                    avatarUrl={avatarUrl}
                />
            )}
            <main className="mx-auto w-full max-w-7xl flex-1 p-6">
                {children}
            </main>
        </div>
    );
}