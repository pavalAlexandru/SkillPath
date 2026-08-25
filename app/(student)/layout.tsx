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

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <StudentNavigation userEmail={user?.email || 'Nespecificat'} />
            <main className="mx-auto w-full max-w-7xl flex-1 p-6">
                {children}
            </main>
        </div>
    );
}