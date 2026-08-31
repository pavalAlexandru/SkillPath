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
        <div className="flex flex-col justify-between rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 opacity-70">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                        {levelBadge}
                    </span>
                </div>

                <div>
                    <h3 className="text-base font-bold text-slate-700 flex items-center gap-1.5">
                        🔒 {title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>

            <div className="mt-6 rounded-xl bg-slate-100/80 py-2 text-center text-xs font-medium text-slate-500">
                {unlockRequirement}
            </div>
        </div>
    );
}