'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';
import { studentNavItems } from '@/lib/navigation';

interface StudentNavigationProps {
    userName?: string;
    userEmail: string;
}

export function StudentNavigation({ userName, userEmail }: StudentNavigationProps) {
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
            items={studentNavItems}
        />
    );
}