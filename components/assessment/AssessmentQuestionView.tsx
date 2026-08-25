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
            
            <div className="flex justify-between items-start gap-4">
                <p className="text-lg font-medium text-slate-900 leading-relaxed">
                    {question.questionText}
                </p>
                {!hint && (
                    <Button 
                        variant="outline" 
                        onClick={handleGetHintClick} 
                        disabled={loadingHint || !canUseHint}
                        className="flex-shrink-0 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5"
                        title={!canUseHint ? "Ai folosit deja indiciul pentru acest test" : ""}
                    >
                        {loadingHint ? 'Se încarcă...' : '💡 Hint'}
                    </Button>
                )}
            </div>

            {hint && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-900 animate-in fade-in zoom-in duration-300">
                    <strong>Sfat AI:</strong> {hint}
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
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${
                                isSelected
                                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-1 ring-indigo-600 shadow-sm'
                                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 text-slate-800'
                            }`}
                        >
                            <input
                                id={inputId}
                                type={isMultiple ? 'checkbox' : 'radio'}
                                name={`question-${question.id}`}
                                checked={isSelected}
                                onChange={() => onSelectOption(opt.id)}
                                className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer ${
                                    isMultiple ? 'rounded border-slate-300' : ''
                                }`}
                            />
                            <span className="text-sm font-normal select-none">{opt.optionText}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
