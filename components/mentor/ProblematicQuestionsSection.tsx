'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import {
    ProblematicQuestion,
    generateSingleQuestionInsight,
    generateAllBatchInsights,
    getTopProblematicQuestions
} from '@/server/actions/mentor-insights';

interface Props {
    initialQuestions: ProblematicQuestion[];
    categories: { id: number; name: string }[];
}

export function ProblematicQuestionsSection({ initialQuestions, categories }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [questions, setQuestions] = useState<ProblematicQuestion[]>(initialQuestions);
    const [loadingSingleId, setLoadingSingleId] = useState<number | null>(null);
    const [loadingBatch, setLoadingBatch] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [expandedId, setExpandedId] = useState<number | null>(null);

    // Ordonăm întrebările descrescător după procentul de eșec (failureRate)
    const sortedQuestions = useMemo(() => {
        return [...questions].sort((a, b) => {
            if (b.failureRate !== a.failureRate) {
                return b.failureRate - a.failureRate;
            }
            return b.wrongAttempts - a.wrongAttempts;
        });
    }, [questions]);

    const handleCategoryChange = (catIdStr: string) => {
        setSelectedCategory(catIdStr);
        startTransition(async () => {
            const filterId = catIdStr === 'ALL' ? undefined : Number(catIdStr);
            const data = await getTopProblematicQuestions(filterId);
            setQuestions(data);
        });
    };

    const handleAnalyzeSingle = async (question: ProblematicQuestion) => {
        setLoadingSingleId(question.questionId);
        try {
            const res = await generateSingleQuestionInsight(question);
            if (res.success && res.insight) {
                setQuestions((prev) =>
                    prev.map((q) =>
                        q.questionId === question.questionId
                            ? {
                                ...q,
                                insight: {
                                    whyFailed: res.insight!.why_failed,
                                    distractorAnalysis: res.insight!.distractor_analysis,
                                    suggestedRefinement: res.insight!.suggested_refinement,
                                    analyzedAt: res.insight!.analyzed_at,
                                },
                            }
                            : q
                    )
                );
            } else {
                alert('Eroare: ' + (res.error || 'Nu s-a putut genera analiza.'));
            }
        } finally {
            setLoadingSingleId(null);
        }
    };

    const handleRunBatchAI = async () => {
        if (sortedQuestions.length === 0) return;
        setLoadingBatch(true);
        try {
            const res = await generateAllBatchInsights(sortedQuestions);
            if (!res.success) {
                alert('Eroare la generare: ' + (res.error || 'A apărut o problemă.'));
                return;
            }
            const filterId = selectedCategory === 'ALL' ? undefined : Number(selectedCategory);
            const updated = await getTopProblematicQuestions(filterId);
            setQuestions(updated);
        } catch (e: unknown) {
            console.error(e);
            alert('Eroare neașteptată la comunicarea cu AI-ul.');
        } finally {
            setLoadingBatch(false);
        }
    };

    const needsAnalysis = sortedQuestions.some((q) => !q.insight);

    return (
        <Card className="border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
            {/* Header & Filtru */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl">⚠️</span>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            {selectedCategory === 'ALL' ? 'Top 5 Întrebări Frecvent Greșite' : 'Întrebări Frecvent Greșite în Categorie'}
                        </h2>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {sortedQuestions.length === 1
                            ? 'A fost identificată o singură întrebare cu răspunsuri greșite în această categorie.'
                            : 'Întrebările clasificate descrescător după procentul de eșec înregistrat.'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        disabled={isPending}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs outline-none transition focus:border-indigo-500 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                    >
                        <option value="ALL">Toate categoriile</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleRunBatchAI}
                        disabled={loadingBatch || isPending || sortedQuestions.length === 0}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                    >
                        {loadingBatch ? (
                            <>
                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Analizăm...
                            </>
                        ) : (
                            <>
                                <span>✨</span>
                                {needsAnalysis ? 'Generează Toate Analizele' : 'Actualizează Toate'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Legendă vizuală */}
            <div className="mt-4 flex flex-wrap items-center gap-4 border-y border-slate-100 py-2.5 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-300">Distribuție opțiuni:</span>
                <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Răspuns corect
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" /> Capcană majoră (&gt;30%)
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-400" /> Distractor minor
                </span>
            </div>

            {/* Listă Întrebări */}
            <div className="mt-6 space-y-4">
                {isPending ? (
                    <div className="py-8 text-center">
                        <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400" />
                        <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">Se încarcă întrebările...</p>
                    </div>
                ) : sortedQuestions.length === 0 ? (
                    <p className="py-8 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
                        Nu există nicio întrebare greșită înregistrată pentru selecția curentă.
                    </p>
                ) : (
                    sortedQuestions.map((item, index) => {
                        const isExpanded = expandedId === item.questionId;
                        const isAnalyzing = loadingSingleId === item.questionId;

                        // Sortăm opțiunile descrescător după procentajul obținut
                        const sortedOptions = [...item.optionsStats].sort((a, b) => b.percentage - a.percentage);

                        return (
                            <div
                                key={item.questionId}
                                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50/50 transition dark:border-slate-800 dark:bg-slate-950/40"
                            >
                                <div className="p-4 sm:p-5">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/10 text-xs font-black text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                                                #{index + 1}
                                            </span>
                                            <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                                                {item.categoryName}
                                            </span>
                                            <span className="rounded-md bg-slate-200/60 px-2 py-0.5 text-[10px] font-extrabold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                {item.difficulty}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                                                    {item.failureRate}% rată eșec
                                                </span>
                                            </div>

                                            {/* Buton redirecționare spre catalogul de întrebări */}
                                            <Link
                                                href={`/questions?edit=${item.questionId}`}
                                                className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800/80 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                                            >
                                                ✏️ Modifică
                                            </Link>

                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : item.questionId)}
                                                className="rounded-lg border border-slate-200/80 bg-white p-1.5 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                                                title="Deschide analiza detaliată"
                                            >
                                                <svg
                                                    className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                                        {item.questionText}
                                    </p>

                                    {/* Bare de distribuție bazate exclusiv pe procentaj */}
                                    <div className="mt-4 space-y-2">
                                        {sortedOptions.map((opt) => (
                                            <div key={opt.id} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className={`font-medium ${opt.isCorrect ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {opt.isCorrect && '✓ '} {opt.text}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                                        {opt.percentage}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${
                                                            opt.isCorrect ? 'bg-emerald-500' : opt.percentage > 30 ? 'bg-rose-500' : 'bg-slate-400'
                                                        }`}
                                                        style={{ width: `${opt.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Secțiune Analiză AI Extinsă */}
                                {isExpanded && (
                                    <div className="border-t border-slate-200/90 bg-white/90 p-5 dark:border-slate-800 dark:bg-slate-900/90">
                                        {item.insight ? (
                                            <div className="space-y-4 text-xs">
                                                <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                                                    <span className="font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                                        ✨ Diagnostic Tehnic (AI)
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-slate-400">
                                                            Salvat: {new Date(item.insight.analyzedAt).toLocaleDateString('ro-RO')}
                                                        </span>
                                                        <button
                                                            onClick={() => handleAnalyzeSingle(item)}
                                                            disabled={isAnalyzing}
                                                            className="text-[11px] font-bold text-indigo-600 hover:underline disabled:opacity-50 dark:text-indigo-400"
                                                        >
                                                            {isAnalyzing ? 'Se actualizează...' : 'Re-generează'}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white">🧠 De ce greșesc studenții:</h4>
                                                    <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">
                                                        {item.insight.whyFailed}
                                                    </p>
                                                </div>

                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white">🎯 Analiza variantelor capcană:</h4>
                                                    <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">
                                                        {item.insight.distractorAnalysis}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 dark:border-indigo-950 dark:bg-indigo-950/20">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-bold text-indigo-950 dark:text-indigo-200">💡 Sugestie de reformulare pentru catalog:</h4>
                                                        <Link
                                                            href={`/questions?edit=${item.questionId}`}
                                                            className="text-[11px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                                                        >
                                                            Aplică în catalog →
                                                        </Link>
                                                    </div>
                                                    <p className="mt-1.5 leading-relaxed text-indigo-900 dark:text-indigo-300">
                                                        {item.insight.suggestedRefinement}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-4 text-center">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Această întrebare nu are încă o analiză tehnică generată.
                                                </p>
                                                <button
                                                    onClick={() => handleAnalyzeSingle(item)}
                                                    disabled={isAnalyzing}
                                                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                                                >
                                                    {isAnalyzing ? (
                                                        <>
                                                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                            Se generează analiza...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>✨</span>
                                                            Generează Analiză AI pentru această întrebare
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </Card>
    );
}