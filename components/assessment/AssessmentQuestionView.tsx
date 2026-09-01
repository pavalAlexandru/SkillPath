'use client';

import React, { useState } from 'react';
import { QuestionItem } from '@/types/assesments';
import { Button } from '@/components/ui/Button';
import { getQuickHint } from '@/server/actions/ai-hint';
import { HintConfirmationModal } from './HintConfirmationModal';

interface AssessmentQuestionViewProps {
    question: QuestionItem;
    selectedOptions: number[];
    isMultiple: boolean;
    onSelectOption: (id: number) => void;
    hint?: string;
    canUseHint: boolean;
    onHintFetched: (text: string) => void;
}

export function AssessmentQuestionView({
                                           question,
                                           selectedOptions,
                                           isMultiple,
                                           onSelectOption,
                                           hint,
                                           canUseHint,
                                           onHintFetched,
                                       }: AssessmentQuestionViewProps) {
    const [loadingHint, setLoadingHint] = useState(false);
    const [isHintModalOpen, setIsHintModalOpen] = useState(false);

    const handleGetHintClick = () => {
        if (!canUseHint) return;
        setIsHintModalOpen(true);
    };

    const handleConfirmHint = async () => {
        setIsHintModalOpen(false);
        setLoadingHint(true);
        const optionsText = question.options.map(o => o.optionText);
        const response = await getQuickHint(question.questionText, optionsText);
        onHintFetched(response);
        setLoadingHint(false);
    };

    return (
        <div className="space-y-6">
            <HintConfirmationModal
                isOpen={isHintModalOpen}
                onClose={() => setIsHintModalOpen(false)}
                onConfirm={handleConfirmHint}
            />

            <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-bold leading-relaxed text-slate-900 dark:text-white sm:text-xl">
                    {question.questionText}
                </h2>
                {!hint && (
                    <Button
                        variant="outline"
                        onClick={handleGetHintClick}
                        disabled={loadingHint || !canUseHint}
                        className="shrink-0 border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60 dark:hover:text-amber-300"
                        title={!canUseHint ? "Ai folosit deja indiciul pentru acest test" : ""}
                    >
                        {loadingHint ? 'Se încarcă...' : '💡 Hint'}
                    </Button>
                )}
            </div>

            {hint && (
                <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 text-xs font-medium leading-relaxed text-amber-900 animate-in fade-in zoom-in duration-300 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                    <strong>💡 Sfat AI:</strong> {hint}
                </div>
            )}

            <div className="space-y-3">
                {question.options.map((opt) => {
                    const isSelected = selectedOptions.includes(opt.id);
                    const inputId = `option-${question.id}-${opt.id}`;

                    return (
                        <label
                            key={opt.id}
                            htmlFor={inputId}
                            className={`flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 transition-all ${
                                isSelected
                                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-xs dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-200'
                                    : 'border-slate-200/90 bg-white/80 text-slate-800 hover:border-slate-300 hover:bg-slate-50/80 dark:border-slate-700/80 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800'
                            }`}
                        >
                            <input
                                id={inputId}
                                type={isMultiple ? 'checkbox' : 'radio'}
                                name={`question-${question.id}`}
                                checked={isSelected}
                                onChange={() => onSelectOption(opt.id)}
                                className={`h-4 w-4 cursor-pointer text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 ${
                                    isMultiple ? 'rounded border-slate-300' : ''
                                }`}
                            />
                            <span className="text-sm font-semibold select-none leading-snug">{opt.optionText}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}