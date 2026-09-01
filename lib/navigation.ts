import type { NavItem } from '@/components/shared/Navbar';

export const studentNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Teste', href: '/assessment' },
    { label: 'Propune Întrebare', href: '/propose' },
    { label: 'Setări', href: '/settings' },
];

export const mentorNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/overview' },
    { label: 'Categorii', href: '/categories' },
    { label: 'Catalog Întrebări', href: '/questions' },
    { label: 'Propuneri Studenți', href: '/proposals' },
    { label: 'Studenți', href: '/students' },
    { label: 'Setări', href: '/settings' },
];
