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
            <Card className="p-6 text-center space-y-4 animate-pulse mt-8">
                <div className="h-6 w-1/3 bg-slate-200 rounded mx-auto"></div>
                <div className="h-4 w-3/4 bg-slate-200 rounded mx-auto"></div>
                <p className="text-sm text-slate-500 font-medium">Se încarcă rezultatele...</p>
            </Card>
        );
    }

    if (wrongAnswers.length === 0) {
        return null;
    }

    return (
        <div className="space-y-8 text-left mt-8">
            <div className="space-y-6">
                <h3 className="text-base font-bold text-slate-900 border-b pb-2">Răspunsuri Greșite</h3>
                {wrongAnswers.map((wa: any, idx: number) => {
                    const totalCorrect = wa.options.filter((o: any) => o.is_correct).length;
                    const selectedCorrect = wa.options.filter((o: any) => o.is_correct && wa.selected_option_ids.includes(o.id)).length;
                    const isMultipleChoice = totalCorrect > 1;
                    const isPartial = isMultipleChoice && selectedCorrect > 0 && selectedCorrect < totalCorrect;

                    return (
                        <Card key={idx} className="p-6 space-y-4 border-slate-200 shadow-sm">
                            <p className="text-lg font-medium text-slate-900 leading-relaxed">
                                {wa.position}. {wa.question_text}
                            </p>
                            <div className="space-y-3">
                                {wa.options.map((opt: any) => {
                                    const isSelected = wa.selected_option_ids.includes(opt.id);
                                    const isCorrect = opt.is_correct;
                                    
                                    let bgClass = "bg-white border-slate-200 text-slate-800";
                                    let icon = null;
                                    
                                    if (isSelected && isCorrect && isPartial) {
                                        bgClass = "bg-amber-50 border-amber-400 text-amber-900 ring-1 ring-amber-400";
                                        icon = <span className="text-amber-600 font-bold">✓</span>;
                                    } else if (isCorrect) {
                                        bgClass = "bg-emerald-50 border-emerald-300 text-emerald-900 ring-1 ring-emerald-400";
                                        icon = <span className="text-emerald-600 font-bold">✓</span>;
                                    } else if (isSelected && !isCorrect) {
                                        bgClass = "bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-400";
                                        icon = <span className="text-rose-600 font-bold">✗</span>;
                                    }

                                    return (
                                        <div key={opt.id} className={`flex items-center gap-3 rounded-lg border p-4 transition-all ${bgClass}`}>
                                            <div className="w-5 flex justify-center">{icon}</div>
                                            <span className="text-sm font-normal select-none">{opt.option_text}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {loadingAI ? (
                <Card className="p-6 text-center space-y-4 border-indigo-100 shadow-sm bg-gradient-to-r from-white to-indigo-50/30">
                    <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-sm font-medium text-indigo-800">Generăm o sinteză AI și recomandări de studiu pentru tine...</p>
                </Card>
            ) : recommendations.length > 0 ? (
                <div className="space-y-6">
                    <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                        <span className="text-2xl">✨</span> Analiză și Recomandări AI
                    </h3>
                    {recommendations.map((rec: any, idx: number) => {
                        const categoryName = wrongAnswers.find((wa: any) => wa.category_id === rec.category_id)?.category_name || "Recomandare Generală";
                        return (
                            <Card key={idx} className="p-6 space-y-4 border-indigo-100 shadow-sm bg-gradient-to-r from-white to-indigo-50/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-bl-lg">
                                    {categoryName}
                                </div>
                                <h4 className="text-lg font-bold text-indigo-900 pr-32">{rec.topic_title}</h4>
                                <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{rec.advice_description}</p>
                                
                                {rec.resources?.length > 0 && (
                                    <div className="pt-4 border-t border-indigo-100/50">
                                        <h5 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3">Caută pe Google</h5>
                                        <ul className="space-y-2">
                                            {rec.resources.map((res: any, i: number) => (
                                                <li key={i}>
                                                    <a 
                                                        href={res.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
                                                    >
                                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                                        {res.title}
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
