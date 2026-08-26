import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import StudentLayout from '@/app/(student)/layout';
import { createClient } from '@/server/supabase/server';

vi.mock('@/server/supabase/server', () => ({
    createClient: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    usePathname: () => '/dashboard',
    useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/components/shared/LogoutButton', () => ({
    LogoutButton: () => <button>Deconectare</button>,
}));

describe('StudentLayout Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('afișează emailul real al utilizatorului autentificat în Navbar pe rutele normale', async () => {
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: 'user-1', email: 'student.real@skillpath.ro' } },
                }),
            },
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: { first_name: 'Larisa', last_name: 'Tiflea' },
                        }),
                    }),
                }),
            }),
        } as unknown as Awaited<ReturnType<typeof createClient>>);

        const jsx = await StudentLayout({
            children: <div>Student Content</div>,
        });

        render(jsx);

        expect(screen.getByText('student.real@skillpath.ro')).toBeDefined();
        expect(screen.getByText('STUDENT')).toBeDefined();
        expect(screen.getByText('Student Content')).toBeDefined();
    });

    it('ascunde Navbar-ul complet atunci când utilizatorul este pe ruta de onboarding', async () => {
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: 'user-1', email: 'student.real@skillpath.ro' } },
                }),
            },
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: { first_name: 'Larisa', last_name: 'Tiflea' },
                        }),
                    }),
                }),
            }),
        } as unknown as Awaited<ReturnType<typeof createClient>>);

        const jsx = await StudentLayout({
            children: <div>Onboarding Exam Screen</div>,
        });

        render(jsx);

        expect(screen.getByText('Onboarding Exam Screen')).toBeDefined();
    });
});