'use client';

import React, { useState } from 'react';
import { QuestionItem, AssessmentResult } from '@/types/assesments';
import { calculateAssessmentScore, completeAssessmentInDb } from '@/server/supabase/assessmentService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface AssessmentRunnerProps {
    assessmentId: string;
    questions: QuestionItem[];
}

export function AssessmentRunner({ assessmentId, questions }: AssessmentRunnerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [result, setResult] = useState<AssessmentResult | null>(null);

    const currentQuestion = questions[currentIndex];
    const selectedOptionId = answers[currentQuestion?.id];
    const isLastQuestion = currentIndex === questions.length - 1;

    const handleSelectOption = (optionId: number) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: optionId,
        }));
    };

    const handleNext = async () => {
        if (!isLastQuestion) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            const calculated = calculateAssessmentScore(questions, answers);
            setResult(calculated);
            await completeAssessmentInDb(assessmentId, calculated.percentage);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    if (result) {
        return (
            <Card className="mx-auto max-w-2xl p-8 text-center space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">
                    Rezultat Evaluare {assessmentId === 'surprise' ? 'Surpriză (Mixt)' : `#${assessmentId}`}
                </h2>
                <div className="rounded-xl bg-slate-50 p-6 border border-slate-100 space-y-2">
                    <p className="text-4xl font-extrabold text-indigo-600">{result.percentage}%</p>
                    <p className="text-sm text-slate-600">
                        Ai răspuns corect la {result.score} din {result.totalQuestions} întrebări.
                    </p>
                    <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            result.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                    >
            {result.passed ? 'PROMOVAT (Nivel validat)' : 'NECESITĂ REVIZUIRE'}
          </span>
                </div>
                <div className="flex justify-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="primary">Înapoi la Dashboard</Button>
                    </Link>
                </div>
            </Card>
        );
    }

    return (
        <Card className="mx-auto max-w-3xl p-8 space-y-6">
            {/* Header & Progres */}
            <div className="space-y-3 border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            {assessmentId === 'surprise' ? 'Test Mixt' : `Categorie #${assessmentId}`} • {currentQuestion.difficulty}
          </span>
                    <span className="text-xs font-medium text-slate-500">
            Întrebarea {currentIndex + 1} din {questions.length}
          </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Întrebare */}
            <p className="text-lg font-medium text-slate-900">{currentQuestion.questionText}</p>

            {/* Opțiuni */}
            <div className="space-y-3">
                {currentQuestion.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                        <label
                            key={opt.id}
                            onClick={() => handleSelectOption(opt.id)}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${
                                isSelected
                                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900 ring-1 ring-indigo-600'
                                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 text-slate-800'
                            }`}
                        >
                            <input
                                type="radio"
                                name={`q-${currentQuestion.id}`}
                                checked={isSelected}
                                onChange={() => handleSelectOption(opt.id)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm">{opt.optionText}</span>
                        </label>
                    );
                })}
            </div>

            {/* Butoane */}
            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0}>
                    Înapoi
                </Button>
                <Button variant="primary" onClick={handleNext} disabled={!selectedOptionId}>
                    {isLastQuestion ? 'Finalizează Testul' : 'Următoarea Întrebare'}
                </Button>
            </div>
        </Card>
    );
}