'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface ExitAssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ExitAssessmentModal({ isOpen, onClose, onConfirm }: ExitAssessmentModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div
                className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/95 dark:text-slate-100"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-100 text-amber-600 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Sigur vrei să părăsești testul?
                        </h3>
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Progresul tău actual și răspunsurile selectate vor fi pierdute. Această sesiune nu va fi salvată.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="py-2 text-xs font-bold"
                    >
                        Rămâi în test
                    </Button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-rose-500 active:scale-95"
                    >
                        Părăsește testul
                    </button>
                </div>
            </div>
        </div>
    );
}