import React from 'react';

interface AssessmentHeaderProps {
    assessmentId: string;
    currentIndex: number;
    totalQuestions: number;
    difficulty: string;
    categoryName?: string;
    isMultiple: boolean;
    selectedCount: number;
    correctCount: number;
}

export function AssessmentHeader({
                                     assessmentId,
                                     currentIndex,
                                     totalQuestions,
                                     difficulty,
                                     categoryName,
                                     isMultiple,
                                     selectedCount,
                                     correctCount,
                                 }: AssessmentHeaderProps) {
    const isComplete = selectedCount === correctCount;

    return (
        <div className="space-y-3 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                        {assessmentId === 'surprise' ? 'Test Mixt' : `Categorie #${assessmentId}`} • {difficulty}
                    </span>

                    {assessmentId === 'surprise' && categoryName && (
                        <span className="rounded bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                            {categoryName}
                        </span>
                    )}

                    <span className="rounded bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {isMultiple ? 'Selecție Multiplă' : 'Răspuns Unic'}
                    </span>

                    <span
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-semibold border transition-colors ${
                            isComplete
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : selectedCount > correctCount
                                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                                    : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                    >
                        <span>Selectate:</span>
                        <strong className="font-bold">
                            {selectedCount} / {correctCount}
                        </strong>
                    </span>
                </div>

                <h1 className="text-sm font-medium text-slate-700">
                    Întrebarea {currentIndex + 1} din {totalQuestions}
                </h1>
            </div>

            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                />
            </div>
        </div>
    );
}