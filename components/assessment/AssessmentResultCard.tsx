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

    const currentEvaluatedLevel = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('level')?.toUpperCase() || 'JUNIOR'
        : 'JUNIOR';

    const promotedToMiddle = isOnboarding && result.percentage >= 90 && currentEvaluatedLevel === 'JUNIOR';
    const promotedToSenior = isOnboarding && result.percentage >= 90 && currentEvaluatedLevel === 'MIDDLE';

    return (
        <Card className="mx-auto max-w-2xl space-y-6 border border-slate-200/80 bg-white/85 p-8 text-center shadow-xl backdrop-blur-xl animate-in fade-in duration-300 dark:border-slate-800/80 dark:bg-slate-900/80 sm:p-10">
            {/* Iconiță status */}
            <div className="flex justify-center">
                {result.passed ? (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 text-emerald-600 shadow-inner dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-400">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-200 bg-amber-100 text-amber-600 shadow-inner dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-400">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Mesaj Titlu & Descriere */}
            <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    {promotedToSenior
                        ? 'Felicitări! Ai atins nivelul maxim: SENIOR!'
                        : promotedToMiddle
                            ? 'Excelent! Ai promovat la nivelul MIDDLE!'
                            : result.passed
                                ? 'Test Finalizat cu Succes!'
                                : 'Evaluare Finalizată'}
                </h2>
                <p className="text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                    {promotedToSenior
                        ? 'Ai obținut peste 90% la testul de Middle și ai fost plasat direct ca SENIOR. Traseul tău complet este deblocat!'
                        : promotedToMiddle
                            ? 'Ai obținut peste 90%! Nivelul tău este acum MIDDLE. Poți continua testul de plasare pentru a încerca nivelul SENIOR sau poți merge la Dashboard.'
                            : `Ai obținut scorul de ${result.percentage}% (${result.score} din ${result.totalQuestions} puncte).`}
                </p>
            </div>

            {/* Scor procentual (Scor obținut) */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                    {result.percentage}%
                </div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Scor obținut
                </div>
            </div>

            {/* Recomandări AI */}
            {!isOnboarding && (
                <div className="pt-2 text-left">
                    {result.newId ? (
                        <AIRecommendations assessmentId={result.newId} />
                    ) : (
                        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 text-center animate-pulse dark:border-slate-800 dark:bg-slate-800/40">
                            <div className="mx-auto h-5 w-1/3 rounded-lg bg-slate-200 dark:bg-slate-700" />
                            <div className="mx-auto h-4 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-700" />
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Se salvează rezultatele și se generează recomandările AI...</p>
                        </div>
                    )}
                </div>
            )}

            {/* Butoane de acțiune */}
            <div className="flex flex-col gap-3 pt-2">
                {isOnboarding ? (
                    promotedToMiddle ? (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    window.location.href = `/assessment/onboarding?level=MIDDLE&t=${Date.now()}`;
                                }}
                                className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-2xs transition hover:bg-indigo-500"
                            >
                                Continuă cu testul pentru nivelul SENIOR →
                            </button>
                            <Link
                                href="/dashboard"
                                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                                Oprește-te aici și mergi la Dashboard (Nivel MIDDLE)
                            </Link>
                        </>
                    ) : (
                        <Link
                            href="/dashboard"
                            className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-2xs transition hover:bg-indigo-500"
                        >
                            {promotedToSenior ? 'Mergi la Dashboard (Nivel SENIOR)' : 'Mergi la Dashboard'}
                        </Link>
                    )
                ) : (
                    <div className="mt-4 flex justify-center gap-4">
                        <Link href="/assessment" className="w-full">
                            <Button variant="primary" className="w-full justify-center py-2.5 font-bold">
                                Înapoi la Teste
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </Card>
    );
}