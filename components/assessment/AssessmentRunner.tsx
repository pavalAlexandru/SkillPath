'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionItem, AssessmentResult } from '@/types/assesments';
import { completeAssessmentAction } from '@/server/actions/assessment';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AssessmentHeader } from './AssessmentHeader';
import { AssessmentQuestionView } from './AssessmentQuestionView';
import { AssessmentResultCard } from './AssessmentResultCard';
import { ExitAssessmentModal } from './ExitAssessmentModal';

export function calculateAssessmentScore(
    questions: QuestionItem[],
    answers: Record<number, number[]>
): AssessmentResult {
    let totalScore = 0;

    questions.forEach((q) => {
        const selectedIds = answers[q.id] || [];
        const correctOptions = q.options.filter((opt) => opt.isCorrect);
        const incorrectOptions = q.options.filter((opt) => !opt.isCorrect);

        const N = correctOptions.length;
        const M = incorrectOptions.length;

        if (N === 0) return;

        let questionScore = 0;

        if (selectedIds.length > 0) {
            let correctChosen = 0;
            let incorrectChosen = 0;

            selectedIds.forEach((id) => {
                if (correctOptions.some((opt) => opt.id === id)) {
                    correctChosen += 1;
                } else {
                    incorrectChosen += 1;
                }
            });

            const penaltyPerWrong = M > 0 ? 1 / M : 0;
            const rewardPerCorrect = 1 / N;

            const rawScore = correctChosen * rewardPerCorrect - incorrectChosen * penaltyPerWrong;
            questionScore = Math.max(0, rawScore);
        }

        totalScore += questionScore;
    });

    const totalQuestions = questions.length || 1;
    const percentage = Math.round((totalScore / totalQuestions) * 100);

    return {
        score: Number(totalScore.toFixed(2)),
        totalQuestions: questions.length,
        percentage,
        passed: percentage >= 60,
    };
}

interface AssessmentRunnerProps {
    assessmentId: string;
    questions: QuestionItem[];
}

export function AssessmentRunner({ assessmentId, questions }: AssessmentRunnerProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number[]>>({});
    const [result, setResult] = useState<AssessmentResult | null>(null);
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);

    const isOnboarding = assessmentId === 'onboarding';
    const currentQuestion = questions[currentIndex];
    const selectedOptions = currentQuestion ? answers[currentQuestion.id] || [] : [];
    const isLastQuestion = currentIndex === questions.length - 1;
    const isMultiple = currentQuestion?.questionType === 'MULTIPLE';

    // Avertisment nativ la Refresh (F5), închidere tab sau tastare URL nou
    useEffect(() => {
        if (result) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = 'Progresul tău actual și răspunsurile selectate vor fi pierdute. Această sesiune nu va fi salvată.';
            return e.returnValue;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [result]);

    const handleSelectOption = (optionId: number) => {
        setAnswers((prev) => {
            const existing = prev[currentQuestion.id] || [];
            if (isMultiple) {
                const updated = existing.includes(optionId)
                    ? existing.filter((id) => id !== optionId)
                    : [...existing, optionId];
                return { ...prev, [currentQuestion.id]: updated };
            } else {
                return { ...prev, [currentQuestion.id]: [optionId] };
            }
        });
    };

    const handleNext = async () => {
        if (!isLastQuestion) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            const calculated = calculateAssessmentScore(questions, answers);
            setResult(calculated);
            await completeAssessmentAction(assessmentId, calculated.percentage, answers, questions);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleConfirmExit = () => {
        setIsExitModalOpen(false);
        router.push('/assessment');
    };

    if (result) {
        return <AssessmentResultCard assessmentId={assessmentId} result={result} />;
    }

    if (!currentQuestion) return null;

    return (
        <>
            <Card className="mx-auto max-w-3xl p-8 space-y-6">
                {/* Buton abandon test - afișat doar dacă NU este onboarding */}
                {!isOnboarding && (
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setIsExitModalOpen(true)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Abandonează testul
                        </button>
                    </div>
                )}

                <AssessmentHeader
                    assessmentId={assessmentId}
                    currentIndex={currentIndex}
                    totalQuestions={questions.length}
                    difficulty={currentQuestion.difficulty}
                    categoryName={currentQuestion.categoryName}
                    isMultiple={isMultiple}
                />

                <AssessmentQuestionView
                    question={currentQuestion}
                    selectedOptions={selectedOptions}
                    isMultiple={isMultiple}
                    onSelectOption={handleSelectOption}
                />

                <div className="flex justify-between pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                    >
                        Înapoi
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleNext}
                        disabled={selectedOptions.length === 0}
                    >
                        {isLastQuestion ? 'Finalizează Testul' : 'Următoarea Întrebare'}
                    </Button>
                </div>
            </Card>

            {/* Modal de confirmare ieșire - activ doar dacă nu este onboarding */}
            {!isOnboarding && (
                <ExitAssessmentModal
                    isOpen={isExitModalOpen}
                    onClose={() => setIsExitModalOpen(false)}
                    onConfirm={handleConfirmExit}
                />
            )}
        </>
    );
}