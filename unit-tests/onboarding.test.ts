import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';
import { createServerClient } from '@supabase/ssr';

vi.mock('@supabase/ssr', () => ({
    createServerClient: vi.fn(),
}));

describe('Adaptive Onboarding Route Enforcement (proxy/middleware)', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
        vi.clearAllMocks();
        // @ts-expect-error - overriding for test
        process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
        // @ts-expect-error - restoring original
        process.env.NODE_ENV = originalEnv;
    });

    it('redirecționează studentul nou (0 teste finalizate) spre /assessment/onboarding dacă încearcă să intre pe /dashboard', async () => {
        const queryBuilder: Record<string, unknown> = {};
        queryBuilder.select = vi.fn().mockReturnValue(queryBuilder);
        queryBuilder.eq = vi.fn().mockReturnValue(queryBuilder);
        queryBuilder.maybeSingle = vi.fn().mockResolvedValue({ data: { role: 'STUDENT' } });
        queryBuilder.then = (resolve: (val: { count: number; error: null }) => void) =>
            resolve({ count: 0, error: null });

        const mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: 'user-new-student-id' } },
                }),
            },
            from: vi.fn(() => queryBuilder),
        };

        vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

        const req = new NextRequest('http://localhost:3000/dashboard');
        const res = await proxy(req);

        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toBe('http://localhost:3000/assessment/onboarding');
    });

    it('permite accesul la /dashboard dacă studentul are cel puțin 1 test finalizat', async () => {
        const queryBuilder: Record<string, unknown> = {};
        queryBuilder.select = vi.fn().mockReturnValue(queryBuilder);
        queryBuilder.eq = vi.fn().mockReturnValue(queryBuilder);
        queryBuilder.maybeSingle = vi.fn().mockResolvedValue({ data: { role: 'STUDENT' } });
        queryBuilder.then = (resolve: (val: { count: number; error: null }) => void) =>
            resolve({ count: 1, error: null });

        const mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: 'user-veteran-student-id' } },
                }),
            },
            from: vi.fn(() => queryBuilder),
        };

        vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

        const req = new NextRequest('http://localhost:3000/dashboard');
        const res = await proxy(req);

        expect(res.status).toBe(200);
        expect(res.headers.get('location')).toBeNull();
    });
});