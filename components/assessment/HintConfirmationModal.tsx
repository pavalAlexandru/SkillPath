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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 space-y-4"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                        <span className="text-xl">💡</span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-900">
                            Confirmare Indiciu
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Ai dreptul la <strong>un singur indiciu</strong> per test. Ești sigur că vrei să-l folosești la această întrebare?
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
                        Anulează
                    </Button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-400 transition-colors shadow-sm"
                    >
                        Folosește indiciul
                    </button>
                </div>
            </div>
        </div>
    );
}
