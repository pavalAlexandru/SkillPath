'use client';

import React, { useEffect, useState } from 'react';
import { getWrongAnswers, generateAIRecommendations } from '@/server/actions/ai-recommendations';
import { Card } from '@/components/ui/Card';

export function AIRecommendations({ assessmentId }: { assessmentId: number }) {
    const [wrongAnswers, setWrongAnswers] = useState<any[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loadingAnswers, setLoadingAnswers] = useState(true);
    const [loadingAI, setLoadingAI] = useState(true);

    useEffect(() => {
        let mounted = true;
        async function loadData() {
            setLoadingAnswers(true);
            const { wrongAnswers: fetchedWrongAnswers } = await getWrongAnswers(assessmentId);

            if (mounted) {
                setWrongAnswers(fetchedWrongAnswers || []);
                setLoadingAnswers(false);
                setLoadingAI(true);
            }

            if (fetchedWrongAnswers && fetchedWrongAnswers.length > 0) {
                const { recommendations: fetchedRecs } = await generateAIRecommendations(assessmentId, fetchedWrongAnswers);
                if (mounted) {
                    setRecommendations(fetchedRecs || []);
                    setLoadingAI(false);
                }
            } else if (mounted) {
                setLoadingAI(false);
            }
        }
        loadData();
        return () => { mounted = false; };
    }, [assessmentId]);

    if (loadingAnswers) {
        return (
            <Card className="mt-8 space-y-4 border border-slate-200/80 bg-white/80 p-6 text-center shadow-xs backdrop-blur-md animate-pulse dark:border-slate-800/80 dark:bg-slate-900/80">
                <div className="mx-auto h-6 w-1/3 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                <div className="mx-auto h-4 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Se încarcă rezultatele...</p>
            </Card>
        );
    }

    if (wrongAnswers.length === 0) {
        return null;
    }

    return (
        <div className="mt-8 space-y-8 text-left">
            {/* Secțiune Răspunsuri Greșite */}
            <div className="space-y-4">
                <h3 className="border-b border-slate-200/80 pb-3 text-lg font-black text-slate-900 dark:border-slate-800 dark:text-white">
                    Răspunsuri Greșite
                </h3>
                {wrongAnswers.map((wa: any, idx: number) => {
                    const totalCorrect = wa.options.filter((o: any) => o.is_correct).length;
                    const selectedCorrect = wa.options.filter((o: any) => o.is_correct && wa.selected_option_ids.includes(o.id)).length;
                    const isMultipleChoice = totalCorrect > 1;
                    const isPartial = isMultipleChoice && selectedCorrect > 0 && selectedCorrect < totalCorrect;

                    return (
                        <Card key={idx} className="space-y-4 border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
                            <p className="text-base font-bold leading-relaxed text-slate-900 dark:text-white">
                                {wa.position}. {wa.question_text}
                            </p>
                            <div className="space-y-2.5">
                                {wa.options.map((opt: any) => {
                                    const isSelected = wa.selected_option_ids.includes(opt.id);
                                    const isCorrect = opt.is_correct;

                                    let bgClass = "bg-white/90 border-slate-200 text-slate-800 dark:bg-slate-800/40 dark:border-slate-700/80 dark:text-slate-200";
                                    let icon = null;

                                    if (isSelected && isCorrect && isPartial) {
                                        bgClass = "bg-amber-50/90 border-amber-300 text-amber-950 dark:bg-amber-950/40 dark:border-amber-800/80 dark:text-amber-200";
                                        icon = <span className="font-bold text-amber-600 dark:text-amber-400">✓</span>;
                                    } else if (isCorrect) {
                                        bgClass = "bg-emerald-50/90 border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800/80 dark:text-emerald-200";
                                        icon = <span className="font-bold text-emerald-600 dark:text-emerald-400">✓</span>;
                                    } else if (isSelected && !isCorrect) {
                                        bgClass = "bg-rose-50/90 border-rose-300 text-rose-950 dark:bg-rose-950/40 dark:border-rose-800/80 dark:text-rose-200";
                                        icon = <span className="font-bold text-rose-600 dark:text-rose-400">✗</span>;
                                    }

                                    return (
                                        <div key={opt.id} className={`flex items-center gap-3 rounded-xl border p-3.5 text-sm transition-all ${bgClass}`}>
                                            <div className="flex w-5 justify-center">{icon}</div>
                                            <span className="font-medium select-none">{opt.option_text}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Secțiune AI Recommendations */}
            {loadingAI ? (
                <Card className="space-y-4 border border-indigo-100/90 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/60 p-6 text-center shadow-xs backdrop-blur-xl dark:border-slate-800/80 dark:bg-gradient-to-r dark:from-slate-900/90 dark:via-slate-900/60 dark:to-indigo-950/40">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400 dark:border-t-transparent"></div>
                    <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Generăm o sinteză AI și recomandări de studiu pentru tine...</p>
                </Card>
            ) : recommendations.length > 0 ? (
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 border-b border-slate-200/80 pb-3 text-lg font-black text-slate-900 dark:border-slate-800 dark:text-white">
                        <span>✨</span> Analiză și Recomandări AI
                    </h3>
                    {recommendations.map((rec: any, idx: number) => {
                        const categoryName = wrongAnswers.find((wa: any) => wa.category_id === rec.category_id)?.category_name || "Recomandare Generală";
                        return (
                            <Card key={idx} className="relative space-y-4 overflow-hidden border border-indigo-100/90 bg-white/80 p-6 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
                                <div className="absolute top-0 right-0 rounded-bl-xl border-b border-l border-indigo-200/80 bg-indigo-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:border-indigo-800/80 dark:bg-indigo-950/70 dark:text-indigo-300">
                                    {categoryName}
                                </div>
                                <h4 className="pr-28 text-base font-bold text-slate-900 dark:text-white">{rec.topic_title}</h4>
                                <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-wrap dark:text-slate-300">{rec.advice_description}</p>

                                {rec.resources?.length > 0 && (
                                    <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                                        <h5 className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Resurse recomandate:</h5>
                                        <ul className="space-y-2">
                                            {rec.resources.map((res: any, i: number) => (
                                                <li key={i}>
                                                    <a
                                                        href={res.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-500 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                        {res.title} ↗
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}