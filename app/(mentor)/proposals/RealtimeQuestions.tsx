'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/server/supabase/client';

export function RealtimeQuestions() {
    const router = useRouter();

    useEffect(() => {
        const supabase = getSupabaseClient();
        
        const channel = supabase.channel('questions-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'questions',
                },
                () => {
                    // Refresh the current route to fetch new data
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router]);

    return null;
}
