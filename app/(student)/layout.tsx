import { Navbar } from '@/components/shared/Navbar';

export default function StudentLayout({
                                          children,
                                      }: {
    children: React.ReactNode;
}) {
    const navItems = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Propune Întrebare', href: '/propose' },
        { label: 'Profil & Progres', href: '/profile' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar roleBadge="STUDENT" userEmail="student@skillpath.ro" items={navItems} />
            <main className="mx-auto w-full max-w-7xl flex-1 p-6">
                {children}
            </main>
        </div>
    );
}