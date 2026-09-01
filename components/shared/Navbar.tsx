'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/shared/LogoutButton';

export interface NavItem {
    label: string;
    href: string;
}

export interface NavbarProps {
    roleBadge?: string;
    userName?: string;
    userEmail: string;
    avatarUrl?: string | null;
    items: NavItem[];
}

export function Navbar({ roleBadge = 'STUDENT', userName, userEmail, avatarUrl, items }: NavbarProps) {
    const pathname = usePathname();
    const displayName = userName?.trim() ? userName : (userEmail || 'Utilizator');
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    const visibleItems = items.filter((item) => {
        if (roleBadge === 'STUDENT') {
            return item.href !== '/profile' && item.label.toLowerCase() !== 'profil';
        }
        return true;
    });

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-2xs transition-colors dark:border-slate-800 dark:bg-slate-900/90">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
                {/* Logo & Rol */}
                <div className="flex items-center gap-8">
                    <Link
                        href={roleBadge === 'MENTOR' ? '/overview' : '/dashboard'}
                        className="flex items-center gap-3 transition hover:opacity-90"
                    >
                        <span className="text-2xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
                            SkillPath
                        </span>
                        <span className="rounded-md bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300">
                            {roleBadge}
                        </span>
                    </Link>

                    {/* Link-uri de navigare */}
                    <nav className="hidden lg:flex items-center gap-1.5">
                        {visibleItems.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href !== '/dashboard' && item.href !== '/overview' && pathname?.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                                        isActive
                                            ? 'bg-indigo-50 text-indigo-700 font-bold dark:bg-indigo-950/60 dark:text-indigo-300'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Avatar & Utilizator & Buton Logout */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-indigo-50 text-xs font-black text-indigo-700 shadow-2xs dark:border-slate-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={displayName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>

                        <div className="hidden sm:flex flex-col items-start leading-tight">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                {displayName}
                            </span>
                            <span className="text-xs text-slate-400 font-medium dark:text-slate-500">
                                {userEmail}
                            </span>
                        </div>
                    </div>

                    <div className="h-6 w-px bg-slate-200 hidden sm:block dark:bg-slate-800" />

                    <LogoutButton />
                </div>
            </div>
        </header>
    );
}