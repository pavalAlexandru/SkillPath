'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';

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

    const navItems = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Teste', href: '/assessment' },
        { label: 'Propune Întrebare', href: '/propose' },
        { label: 'Profil & Progres', href: '/profile' },
    ];

    return (
        <Navbar
            roleBadge="STUDENT"
            userName={userName}
            userEmail={userEmail}
            items={navItems}
        />
    );
}