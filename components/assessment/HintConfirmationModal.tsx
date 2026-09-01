'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface HintConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function HintConfirmationModal({ isOpen, onClose, onConfirm }: HintConfirmationModalProps) {
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
                        <span className="text-xl">💡</span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Confirmare Indiciu
                        </h3>
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Ai dreptul la <strong>un singur indiciu</strong> per test. Ești sigur că vrei să-l folosești la această întrebare?
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
                        Anulează
                    </Button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-amber-400 active:scale-95"
                    >
                        Folosește indiciul
                    </button>
                </div>
            </div>
        </div>
    );
}