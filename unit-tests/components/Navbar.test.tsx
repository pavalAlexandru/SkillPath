import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '@/components/shared/Navbar';

// Mock pentru Next.js navigation
const mockPathname = vi.fn();
vi.mock('next/navigation', () => ({
    usePathname: () => mockPathname(),
    useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

// Mock pentru LogoutButton ca să izolăm Navbar-ul
vi.mock('@/components/shared/LogoutButton', () => ({
    LogoutButton: () => <button data-testid="logout-btn">Logout</button>,
}));

describe('Unit Test - <Navbar />', () => {
    const defaultItems = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Teste', href: '/assessment' },
        { label: 'Profil & Progres', href: '/profile' },
    ];

    it('randează numele utilizatorului și badge-ul de rol', () => {
        mockPathname.mockReturnValue('/dashboard');

        render(
            <Navbar
                roleBadge="STUDENT"
                userName="Larisa Tiflea"
                userEmail="larisa@skillpath.com"
                items={defaultItems}
            />
        );

        expect(screen.getByText('Larisa Tiflea')).toBeDefined();
        expect(screen.getByText('larisa@skillpath.com')).toBeDefined();
        expect(screen.getByText('STUDENT')).toBeDefined();
    });

    it('folosește email-ul ca fallback dacă userName este gol sau nespecificat', () => {
        mockPathname.mockReturnValue('/dashboard');

        render(
            <Navbar
                roleBadge="STUDENT"
                userEmail="student@skillpath.com"
                items={defaultItems}
            />
        );

        // Trebuie să apară emailul în locul numelui
        const elements = screen.getAllByText('student@skillpath.com');
        expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it('evidențiază corect tab-ul activ pe baza rutei curente', () => {
        mockPathname.mockReturnValue('/assessment');

        render(
            <Navbar
                roleBadge="STUDENT"
                userName="Larisa Tiflea"
                userEmail="larisa@skillpath.com"
                items={defaultItems}
            />
        );

        const activeLink = screen.getByRole('link', { name: /teste/i });
        const inactiveLink = screen.getByRole('link', { name: /dashboard/i });

        // Tab-ul activ trebuie să aibă clasa specifică
        expect(activeLink.className).toContain('text-indigo-700');
        expect(activeLink.className).toContain('bg-indigo-50');

        // Tab-ul inactiv nu trebuie să aibă stilul activ
        expect(inactiveLink.className).not.toContain('bg-indigo-50');
    });
});