import { Navbar } from '@/components/shared/Navbar';

export default function MentorLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    const navItems = [
        { label: 'Categorii', href: '/categories' },
        { label: 'Catalog Întrebări', href: '/questions' },
        { label: 'Propuneri Studenți', href: '/proposals' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar roleBadge="MENTOR" userEmail="profesor@skillpath.ro" items={navItems} />
            <main className="mx-auto w-full max-w-7xl flex-1 p-6">
                {children}
            </main>
        </div>
    );
}