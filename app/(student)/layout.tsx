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

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single();

        if (profile) {
            userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <StudentNavigation
                userName={userName}
                userEmail={user?.email || 'Nespecificat'}
            />
            <main className="mx-auto w-full max-w-7xl flex-1 p-6">
                {children}
            </main>
        </div>
    );
}