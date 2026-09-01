import React from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { createClient } from '@/server/supabase/server';
import { mentorNavItems } from '@/lib/navigation';

export default async function MentorLayout({
                                               children,
                                           }: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userName = '';
    let avatarUrl: string | null = null;

    if (user) {
        const { data: profile } = await (supabase.from('profiles') as any)
            .select('first_name, last_name, avatar_url')
            .eq('id', user.id)
            .maybeSingle();

        if (profile) {
            userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
            avatarUrl = profile.avatar_url ?? null;
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors duration-150 dark:bg-slate-950 dark:text-slate-100">
            <Navbar
                roleBadge="MENTOR"
                userName={userName}
                userEmail={user?.email || 'Nespecificat'}
                avatarUrl={avatarUrl}
                items={mentorNavItems}
            />
            <main className="mx-auto w-full max-w-7xl flex-1 p-6">
                {children}
            </main>
        </div>
    );
}