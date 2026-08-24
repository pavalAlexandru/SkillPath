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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 space-y-4"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-900">
                            Sigur vrei să părăsești testul?
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Progresul tău actual și răspunsurile selectate vor fi pierdute. Această sesiune nu va fi salvată.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="text-xs font-semibold"
                    >
                        Rămâi în test
                    </Button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-sm"
                    >
                        Părăsește testul
                    </button>
                </div>
            </div>
        </div>
    );
}