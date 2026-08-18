import { Navbar } from '@/components/shared/Navbar';

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    const navItems = [
        { label: 'Gestiune Utilizatori', href: '/users' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar roleBadge="ADMIN" userEmail="admin@skillpath.ro" items={navItems} />
            <main className="mx-auto w-full max-w-7xl flex-1 p-6">
                {children}
            </main>
        </div>
    );
}