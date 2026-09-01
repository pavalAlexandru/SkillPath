'use client';

import React from 'react';

interface AssessmentHeaderProps {
    assessmentId: string;
    currentIndex: number;
    totalQuestions: number;
    difficulty: string;
    categoryName?: string;
    isMultiple: boolean;
}

const DIFICULTATE_CULOARE: Record<string, string> = {
    EASY: 'text-emerald-600 dark:text-emerald-400',
    MEDIUM: 'text-amber-600 dark:text-amber-400',
    HARD: 'text-rose-600 dark:text-rose-400',
};

export function AssessmentHeader({
                                     assessmentId,
                                     currentIndex,
                                     totalQuestions,
                                     difficulty,
                                     categoryName,
                                     isMultiple,
                                 }: AssessmentHeaderProps) {
    const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;

    return (
        <div className="space-y-3.5 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {assessmentId === 'surprise' ? 'Test Mixt' : `Categorie #${assessmentId}`}
                    </span>

                    <span className="text-slate-300 dark:text-slate-700">•</span>

                    <span className={`text-xs font-extrabold uppercase tracking-wider ${DIFICULTATE_CULOARE[difficulty] || 'text-slate-600'}`}>
                        {difficulty}
                    </span>

                    {assessmentId === 'surprise' && categoryName && (
                        <span className="rounded-md border border-indigo-200/80 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/60 dark:text-indigo-300">
                            {categoryName}
                        </span>
                    )}

                    <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {isMultiple ? 'Selecție Multiplă' : 'Răspuns Unic'}
                    </span>
                </div>

                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Întrebarea {currentIndex + 1} din {totalQuestions}
                </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                    className="h-full rounded-full bg-indigo-600 shadow-2xs transition-all duration-300 dark:bg-indigo-500"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
        </div>
    );
}