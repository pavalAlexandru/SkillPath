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
    items: NavItem[];
}

export function Navbar({ roleBadge = 'STUDENT', userName, userEmail, items }: NavbarProps) {
    const pathname = usePathname();
    const displayName = userName?.trim() ? userName : (userEmail || 'Utilizator');

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-2xs">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                {/* Logo & Rol */}
                <div className="flex items-center gap-10">
                    <Link href="/dashboard" className="flex items-center gap-3 transition hover:opacity-90">
                        <span className="text-2xl font-black tracking-tight text-indigo-600">SkillPath</span>
                        <span className="rounded-md bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider text-indigo-700">
                            {roleBadge}
                        </span>
                    </Link>

                    {/* Link-uri de navigare cu scris mai mare și evidențiere clară */}
                    <nav className="hidden md:flex items-center gap-2">
                        {items.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href !== '/dashboard' && pathname?.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`relative rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 ${
                                        isActive
                                            ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    {item.label}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-indigo-600" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Profil utilizator & Buton Logout */}
                <div className="flex items-center gap-5">
                    <div className="hidden sm:flex flex-col items-end text-right">
                        <span className="text-sm font-bold text-slate-900 leading-tight">
                            {displayName}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                            {userEmail}
                        </span>
                    </div>

                    <div className="h-5 w-px bg-slate-200 hidden sm:block" />

                    <LogoutButton />
                </div>
            </div>
        </header>
    );
}