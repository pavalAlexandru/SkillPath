import { vi, beforeAll } from 'vitest';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// BYPASS THE HARDCODED MOCKS IN THE APP
Object.defineProperty(process.env, 'NODE_ENV', {
    value: 'development',
    configurable: true
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.TEST_USER_PASSWORD;

if (!supabaseUrl || !supabaseKey || !serviceKey || !password) {
    throw new Error('Missing Supabase environment variables');
}

export const adminClient = createSupabaseClient(supabaseUrl, serviceKey);

// We keep two separate clients for testing student and mentor flows
export const studentClient = createSupabaseClient(supabaseUrl, supabaseKey);
export const mentorClient = createSupabaseClient(supabaseUrl, supabaseKey);

beforeAll(async () => {
    // Authenticate student
    const { error: studentErr } = await studentClient.auth.signInWithPassword({
        email: 'student@test.com',
        password
    });
    if (studentErr) throw new Error('Student auth failed: ' + studentErr.message);

    // Authenticate mentor
    const { error: mentorErr } = await mentorClient.auth.signInWithPassword({
        email: 'mentor@test.com',
        password
    });
    if (mentorErr) throw new Error('Mentor auth failed: ' + mentorErr.message);
});

// A mechanism to switch the mock client dynamically
let mockRole = 'STUDENT';
export function setMockUserRole(role: 'STUDENT' | 'MENTOR') {
    mockRole = role;
}

vi.mock('@/server/supabase/server', () => ({
    createClient: async () => mockRole === 'MENTOR' ? mentorClient : studentClient
}));

vi.mock('@/server/supabase', () => ({
    get supabase() { return mockRole === 'MENTOR' ? mentorClient : studentClient; },
    getSupabaseClient: () => mockRole === 'MENTOR' ? mentorClient : studentClient
}));

vi.mock('@/server/supabase/client', () => ({
    get supabase() { return mockRole === 'MENTOR' ? mentorClient : studentClient; },
    getSupabaseClient: () => mockRole === 'MENTOR' ? mentorClient : studentClient
}));

vi.mock('next/headers', () => ({
    cookies: async () => ({
        get: () => null,
        getAll: () => [],
        set: () => {},
    })
}));

vi.mock('next/cache', () => ({
    revalidatePath: () => {}
}));
