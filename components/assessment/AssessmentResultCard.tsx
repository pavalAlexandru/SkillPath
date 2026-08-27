'use client';

import React from 'react';
import Link from 'next/link';
import { AssessmentResult } from '@/types/assesments';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AIRecommendations } from './AIRecommendations';

interface AssessmentResultCardProps {
    assessmentId: string;
    result: AssessmentResult;
}

export function AssessmentResultCard({ assessmentId, result }: AssessmentResultCardProps) {
    const isOnboarding = assessmentId === 'onboarding';

    // Verificăm ce nivel a fost evaluat în testul curent din query param
    const currentEvaluatedLevel = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('level')?.toUpperCase() || 'JUNIOR'
        : 'JUNIOR';

    // Dacă a dat testul de JUNIOR și a luat >= 90%, devine MIDDLE și poate continua spre SENIOR
    const promotedToMiddle = isOnboarding && result.percentage >= 90 && currentEvaluatedLevel === 'JUNIOR';

    // Dacă a dat testul de MIDDLE și a luat >= 90%, devine SENIOR (nivel maxim!)
    const promotedToSenior = isOnboarding && result.percentage >= 90 && currentEvaluatedLevel === 'MIDDLE';

    return (
        <Card className="mx-auto max-w-xl p-8 text-center space-y-6 animate-in fade-in duration-300">
            {/* Iconiță status */}
            <div className="flex justify-center">
                {result.passed ? (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Mesaj Titlu & Descriere */}
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">
                    {promotedToSenior
                        ? 'Felicitări! Ai atins nivelul maxim: SENIOR!'
                        : promotedToMiddle
                            ? 'Excelent! Ai promovat la nivelul MIDDLE!'
                            : result.passed
                                ? 'Test Finalizat cu Succes!'
                                : 'Evaluare Finalizată'}
                </h2>
                <p className="text-sm text-slate-500">
                    {promotedToSenior
                        ? 'Ai obținut peste 90% la testul de Middle și ai fost plasat direct ca SENIOR. Traseul tău complet este deblocat!'
                        : promotedToMiddle
                            ? 'Ai obținut peste 90%! Nivelul tău este acum MIDDLE. Poți continua testul de plasare pentru a încerca nivelul SENIOR sau poți merge la Dashboard.'
                            : `Ai obținut scorul de ${result.percentage}% (${result.score} din ${result.totalQuestions} puncte).`}
                </p>
            </div>

            {/* Scor procentual (Mastery Score) */}
            <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100">
                <div className="text-4xl font-extrabold text-indigo-600">
                    {result.percentage}%
                </div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                    Mastery Score
                </div>
            </div>

            {/* Recomandări AI - afișate pentru testele normale de evaluare */}
            {!isOnboarding && (
                <div className="pt-2 text-left">
                    {result.newId ? (
                        <AIRecommendations assessmentId={result.newId} />
                    ) : (
                        <div className="p-6 text-center space-y-4 animate-pulse border border-slate-100 rounded-xl bg-slate-50/50">
                            <div className="h-5 w-1/3 bg-slate-200 rounded mx-auto" />
                            <div className="h-4 w-3/4 bg-slate-200 rounded mx-auto" />
                            <p className="text-sm text-slate-500 font-medium">Se salvează rezultatele și se generează recomandările AI...</p>
                        </div>
                    )}
                </div>
            )}

            {/* Butoane de acțiune condiționate */}
            <div className="pt-2 flex flex-col gap-3">
                {isOnboarding ? (
                    promotedToMiddle ? (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    window.location.href = `/assessment/onboarding?level=MIDDLE&t=${Date.now()}`;
                                }}
                                className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-500 transition-colors"
                            >
                                Continuă cu testul pentru nivelul SENIOR →
                            </button>
                            <Link
                                href="/dashboard"
                                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Oprește-te aici și mergi la Dashboard (Nivel MIDDLE)
                            </Link>
                        </>
                    ) : (
                        <Link
                            href="/dashboard"
                            className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-500 transition-colors"
                        >
                            {promotedToSenior ? 'Mergi la Dashboard (Nivel SENIOR)' : 'Mergi la Dashboard'}
                        </Link>
                    )
                ) : (
                    <div className="flex justify-center gap-4 mt-4">
                        <Link href="/assessment" className="w-full">
                            <Button variant="primary" className="w-full justify-center">
                                Înapoi la Teste
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </Card>
    );
}