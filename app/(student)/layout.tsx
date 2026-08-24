import { Navbar } from '@/components/shared/Navbar';
import { createClient } from '@/server/supabase/server';

export default async function StudentLayout({
                                                children,
                                            }: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const navItems = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Teste', href: '/assessment' },
        { label: 'Propune Întrebare', href: '/propose' },
        { label: 'Profil & Progres', href: '/profile' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar
                roleBadge="STUDENT"
                userEmail={user?.email || 'Nespecificat'}
                items={navItems}
            />
            <main className="mx-auto w-full max-w-7xl flex-1 p-6">
                {children}
            </main>
        </div>
    );
}