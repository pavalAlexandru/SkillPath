'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';
import { studentNavItems } from '@/lib/navigation';

interface StudentNavigationProps {
    userName?: string;
    userEmail: string;
    avatarUrl?: string | null;
}

export function StudentNavigation({ userName, userEmail, avatarUrl }: StudentNavigationProps) {
    const pathname = usePathname();
    const isOnboarding = pathname?.startsWith('/assessment/onboarding');

    if (isOnboarding) {
        return null;
    }

    return (
        <Navbar
            roleBadge="STUDENT"
            userName={userName}
            userEmail={userEmail}
            avatarUrl={avatarUrl}
            items={studentNavItems}
        />
    );
}