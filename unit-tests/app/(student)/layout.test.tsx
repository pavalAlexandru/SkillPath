import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import StudentLayout from '@/app/(student)/layout';
import { createClient } from '@/server/supabase/server';

vi.mock('@/server/supabase/server', () => ({
    createClient: vi.fn(),
}));

vi.mock('@/components/shared/LogoutButton', () => ({
    LogoutButton: () => <button>Deconectare</button>,
}));

describe('StudentLayout Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('afișează emailul real al utilizatorului autentificat în Navbar', async () => {
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { email: 'student.real@skillpath.ro' } },
                }),
            },
        } as unknown as Awaited<ReturnType<typeof createClient>>);

        const jsx = await StudentLayout({
            children: <div>Student Content</div>,
        });

        render(jsx);

        expect(screen.getByText('student.real@skillpath.ro')).toBeDefined();
        expect(screen.getByText('STUDENT')).toBeDefined();
        expect(screen.getByText('Student Content')).toBeDefined();
    });

    it('afișează fallback când utilizatorul nu are email', async () => {
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: null },
                }),
            },
        } as unknown as Awaited<ReturnType<typeof createClient>>);

        const jsx = await StudentLayout({
            children: <div>Content</div>,
        });

        render(jsx);

        expect(screen.getByText('Nespecificat')).toBeDefined();
    });
});