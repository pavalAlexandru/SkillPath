import React from 'react';

interface LockedCategoryCardProps {
    title: string;
    description: string;
    levelBadge: string;
    unlockRequirement: string;
}

export function LockedCategoryCard({
                                       title,
                                       description,
                                       levelBadge,
                                       unlockRequirement,
                                   }: LockedCategoryCardProps) {
    return (
        <div className="flex flex-col justify-between rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/60 p-6 opacity-75 backdrop-blur-md transition-all dark:border-slate-800/80 dark:bg-slate-900/40">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-500">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <span className="rounded-md border border-slate-200 bg-slate-200/80 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                        {levelBadge}
                    </span>
                </div>

                <div>
                    <h3 className="flex items-center gap-1.5 text-base font-bold text-slate-700 dark:text-slate-300">
                        🔒 {title}
                    </h3>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-400 dark:text-slate-500">
                        {description}
                    </p>
                </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200/60 bg-slate-100/80 py-2.5 text-center text-xs font-semibold text-slate-600 dark:border-slate-800/60 dark:bg-slate-800/60 dark:text-slate-400">
                {unlockRequirement}
            </div>
        </div>
    );
}