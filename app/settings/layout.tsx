import React from 'react';
import { createClient } from '@/server/supabase/server';
import { Navbar } from '@/components/shared/Navbar';
import { StudentNavigation } from '@/components/shared/StudentNavigation';

const mentorNavItems = [
    { label: 'Dashboard', href: '/overview' },
    { label: 'Categorii', href: '/categories' },
    { label: 'Catalog Întrebări', href: '/questions' },
    { label: 'Propuneri Studenți', href: '/proposals' },
    { label: 'Studenți', href: '/students' },
];

export default async function SettingsLayout({
                                                 children,
                                             }: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id ?? '')
        .maybeSingle();

    const isMentor = profile?.role?.trim().toLowerCase() === 'mentor';
    const userEmail = user?.email || 'Nespecificat';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {isMentor ? (
                <Navbar roleBadge="MENTOR" userEmail={userEmail} items={mentorNavItems} />
            ) : (
                <StudentNavigation userEmail={userEmail} />
            )}
            <main className="mx-auto w-full max-w-7xl flex-1 p-6">
                {children}
            </main>
        </div>
    );
}