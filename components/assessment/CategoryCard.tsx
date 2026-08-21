import React from 'react';
import Link from 'next/link';
import { CategoryProgress } from '@/server/supabase/assessmentService';

interface CategoryCardProps {
    id: number;
    name: string;
    description: string;
    level: string;
    progress?: CategoryProgress;
}

export function CategoryCard({ id, name, description, level, progress }: CategoryCardProps) {
    const hasAttempted = !!progress;
    const isPassed = progress?.passed;

    return (
        <div
            className={`flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md border-t-4 ${
                !hasAttempted
                    ? 'border-t-indigo-500'
                    : isPassed
                        ? 'border-t-emerald-500'
                        : 'border-t-amber-500'
            }`}
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="rounded bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        {level}
                    </span>

                    {hasAttempted && (
                        <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                                isPassed
                                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                    : 'bg-amber-50 border border-amber-200 text-amber-700'
                            }`}
                        >
                            {isPassed ? 'PASSED' : '⚠️ REVIEW'}
                        </span>
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-900">{name}</h3>
                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Scorul Real din Baza de Date */}
                {hasAttempted && (
                    <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-500">Mastery Score</span>
                            <span className={isPassed ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                                {progress.lastScore}%
                            </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    isPassed ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${progress.lastScore}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-2">
                <Link
                    href={`/assessment/${id}`}
                    className={`inline-flex w-full items-center justify-center rounded-xl py-2.5 text-xs font-semibold shadow-sm transition active:scale-98 ${
                        !hasAttempted
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : isPassed
                                ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                : 'border border-amber-200 bg-amber-50/50 text-amber-900 hover:bg-amber-100/60'
                    }`}
                >
                    {!hasAttempted ? 'Start Assessment' : isPassed ? 'Review Material' : 'Try again'}
                </Link>
            </div>
        </div>
    );
}