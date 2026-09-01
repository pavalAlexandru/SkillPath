import React from 'react';
import { createClient } from '@/server/supabase/server';
import { StudentNavigation } from '@/components/shared/StudentNavigation';

export default async function StudentLayout({
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
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <StudentNavigation
                userName={userName}
                userEmail={user?.email || 'Nespecificat'}
                avatarUrl={avatarUrl}
            />
            <main className="mx-auto w-full max-w-7xl flex-1 p-6">
                {children}
            </main>
        </div>
    );
}