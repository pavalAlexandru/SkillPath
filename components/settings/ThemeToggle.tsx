'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="h-20 rounded-2xl border border-slate-200/80 bg-slate-100/50 animate-pulse dark:border-slate-800 dark:bg-slate-800/40" />
                <div className="h-20 rounded-2xl border border-slate-200/80 bg-slate-100/50 animate-pulse dark:border-slate-800 dark:bg-slate-800/40" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Buton Luminos */}
            <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-5 transition-all cursor-pointer ${
                    theme === 'light'
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200'
                        : 'border-slate-200/90 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800/70'
                }`}
            >
                <span className="text-2xl">☀️</span>
                <span className="text-sm font-bold">Luminos</span>
            </button>

            {/* Buton Întunecat */}
            <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-5 transition-all cursor-pointer ${
                    theme === 'dark'
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200'
                        : 'border-slate-200/90 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800/70'
                }`}
            >
                <span className="text-2xl">🌙</span>
                <span className="text-sm font-bold">Întunecat</span>
            </button>
        </div>
    );
}