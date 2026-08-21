import Link from 'next/link';
import { LogoutButton } from './LogoutButton';

export interface NavItem {
    label: string;
    href: string;
}

interface NavbarProps {
    roleBadge?: string;
    userEmail?: string;
    items?: NavItem[];
}

export function Navbar({
                           roleBadge = 'STUDENT',
                           userEmail = 'user@skillpath.ro',
                           items = [],
                       }: NavbarProps) {
    return (
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-indigo-600">Skillpath</span>
                        {roleBadge && (
                            <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                {roleBadge}
              </span>
                        )}
                    </div>
                    <nav className="flex gap-6 text-sm font-medium text-slate-700">
                        {items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="hover:text-indigo-600 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600">{userEmail}</span>
                    <LogoutButton />
                </div>
            </div>
        </header>
    );
}