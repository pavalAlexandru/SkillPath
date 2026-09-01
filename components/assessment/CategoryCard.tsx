'use client';

import React from 'react';
import Link from 'next/link';
import { CategoryProgress } from '@/server/supabase/assessmentService';

interface CategoryCardProps {
    id: number;
    name: string;
    description: string;
    level: string;
    progress?: CategoryProgress;
    isLocked?: boolean;
}

function getCategoryIcon(name: string, isLocked?: boolean) {
    if (isLocked) {
        return (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/60 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>
        );
    }

    const lower = name.toLowerCase();
    if (lower.includes('oop') || lower.includes('object')) {
        return (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200/80 bg-emerald-50 text-emerald-600 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            </div>
        );
    }
    if (lower.includes('git') || lower.includes('version')) {
        return (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200/80 bg-amber-50 text-amber-600 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            </div>
        );
    }
    if (lower.includes('sql') || lower.includes('data') || lower.includes('database')) {
        return (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
            </div>
        );
    }
    return (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-200/80 bg-indigo-50 text-indigo-600 dark:border-indigo-800/60 dark:bg-indigo-950/60 dark:text-indigo-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        </div>
    );
}

export function CategoryCard({ id, name, description, level, progress, isLocked }: CategoryCardProps) {
    const score = progress ? Math.round(Number(progress.lastScore)) : null;
    const isCompleted = progress !== undefined && score !== null;

    const isMastered = isCompleted && score >= 90;
    const isInProgress = isCompleted && score < 90;
    const isUnattempted = !isCompleted && !isLocked;

    const topBorderColor = isMastered
        ? 'border-t-[3px] border-t-emerald-500'
        : isInProgress
            ? 'border-t-[3px] border-t-amber-400'
            : isUnattempted
                ? 'border-t-[3px] border-t-indigo-500'
                : 'border-t-transparent';

    return (
        <div
            className={`flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md transition-all hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/80 ${topBorderColor} ${
                isLocked ? 'opacity-60 bg-slate-50/50 dark:bg-slate-950/40' : ''
            }`}
        >
            <div className="space-y-3.5">
                {/* Header Card */}
                <div className="flex items-center justify-between">
                    {getCategoryIcon(name, isLocked)}

                    {isLocked && (
                        <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                            {level}
                        </span>
                    )}

                    {isMastered && (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300">
                            PROMOVAT
                        </span>
                    )}

                    {isInProgress && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300">
                            ⚠️ REVIZUIRE
                        </span>
                    )}

                    {isUnattempted && (
                        <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/60 dark:text-indigo-300">
                            NETESTAT
                        </span>
                    )}
                </div>

                {/* Titlu și descriere */}
                <div>
                    <h3 className="flex items-center gap-1.5 text-base font-bold leading-snug text-slate-900 dark:text-white">
                        {isLocked && (
                            <svg className="inline h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        )}
                        {name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                        {description}
                    </p>
                </div>

                {/* Mesaje de ghidare */}
                {isInProgress && (
                    <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs font-medium leading-relaxed text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                        Scorul este sub pragul de 90% necesar pentru a debloca nivelul următor.
                    </div>
                )}

                {isUnattempted && (
                    <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/70 p-3 text-xs font-medium leading-relaxed text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-200">
                        Nu ai susținut încă această evaluare. Țintește un scor de minim 90%.
                    </div>
                )}
            </div>

            {/* Secțiune inferioară: Progres & Buton */}
            <div className="mt-5 space-y-3.5">
                {isCompleted && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                            <span>Scor</span>
                            <span className={isMastered ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}>
                                {score}%
                            </span>
                        </div>

                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                    isMastered ? 'bg-emerald-500' : 'bg-amber-400'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Butoane */}
                {isLocked ? (
                    <div className="pt-1.5 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
                        Se deblochează la 90% pe toate categoriile de Junior
                    </div>
                ) : isMastered ? (
                    <Link
                        href={`/assessment/${id}`}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                        Revizuiește Materialul
                    </Link>
                ) : isInProgress ? (
                    <Link
                        href={`/assessment/${id}`}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                        <svg className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Încearcă din nou
                    </Link>
                ) : (
                    <Link
                        href={`/assessment/${id}`}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    >
                        Începe Evaluarea
                    </Link>
                )}
            </div>
        </div>
    );
}