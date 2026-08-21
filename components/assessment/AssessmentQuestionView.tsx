import React from 'react';
import { QuestionItem } from '@/types/assesments';

interface AssessmentQuestionViewProps {
    question: QuestionItem;
    selectedOptions: number[];
    isMultiple: boolean;
    onSelectOption: (id: number) => void;
}

export function AssessmentQuestionView({
                                           question,
                                           selectedOptions,
                                           isMultiple,
                                           onSelectOption,
                                       }: AssessmentQuestionViewProps) {
    return (
        <div className="space-y-6">
            <p className="text-lg font-medium text-slate-900 leading-relaxed">
                {question.questionText}
            </p>

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