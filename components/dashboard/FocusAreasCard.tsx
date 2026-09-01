'use client';

import React, { useState } from 'react';
import { FocusArea } from '@/server/supabase/dashboardService';

interface FocusAreasCardProps {
    focusAreas: FocusArea[];
    allRecommendations: FocusArea[];
}

export function FocusAreasCard({ focusAreas, allRecommendations }: FocusAreasCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            {/* Cardul principal din Dashboard */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Arii de îmbunătățire</h3>
                            <p className="text-[11px] text-slate-400">Subiecte recente recomandate pentru aprofundare</p>
                        </div>
                        <span className="text-amber-500 text-sm">💡</span>
                    </div>

                    <div className="space-y-3">
                        {focusAreas.length > 0 ? (
                            focusAreas.map((area) => {
                                const fallbackSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(area.topicTitle)}`;

                                return (
                                    <div key={area.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                                                    {area.categoryName}
                                                </span>
                                                <h4 className="text-xs font-bold text-slate-900">{area.topicTitle}</h4>
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-slate-600 leading-relaxed">
                                            {area.advice}
                                        </p>

                                        {/* Link-uri de Documentație & Căutare */}
                                        <div className="pt-1 flex flex-wrap items-center gap-2">
                                            {area.resources.length > 0 ? (
                                                area.resources.map((res, rIdx) => (
                                                    <a
                                                        key={rIdx}
                                                        href={res.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition shadow-2xs"
                                                    >
                                                        <span>🔗</span>
                                                        <span className="truncate max-w-[190px]">{res.title}</span>
                                                        <span className="text-[9px] text-slate-400">↗</span>
                                                    </a>
                                                ))
                                            ) : (
                                                <a
                                                    href={fallbackSearchUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition shadow-2xs"
                                                >
                                                    <span>🔍</span>
                                                    <span>Caută pe Google</span>
                                                    <span className="text-[9px] text-slate-400">↗</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-center text-xs text-emerald-800">
                                Felicitări! Nu ai arii slabe identificate în acest moment.
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Se deschid direct în tab nou</span>
                    {allRecommendations.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer flex items-center gap-1"
                        >
                            Vezi toate recomandările ({allRecommendations.length}) &gt;
                        </button>
                    )}
                </div>
            </div>

            {/* Modal Pop-up: Istoric Complet Recomandări (FĂRĂ butonul Închide de jos) */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in duration-200"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Modal cu unicul buton X */}
                        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <span>📚</span> Istoric Recomandări & Resurse
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Toate subiectele recomandate pe baza evaluărilor tale anterioare
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition text-sm font-bold leading-none cursor-pointer"
                                aria-label="Închide fereastra"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Listă Recomandări */}
                        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                            {allRecommendations.map((item) => {
                                const fallbackSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(item.topicTitle)}`;

                                return (
                                    <div key={item.id} className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2.5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase">
                                                        {item.categoryName}
                                                    </span>
                                                    {item.createdAt && (
                                                        <span className="text-[10px] text-slate-400">
                                                            {item.createdAt}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-900 mt-1">{item.topicTitle}</h4>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            {item.advice}
                                        </p>

                                        {/* Resurse */}
                                        <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
                                            {item.resources.length > 0 ? (
                                                item.resources.map((res, rIdx) => (
                                                    <a
                                                        key={rIdx}
                                                        href={res.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition shadow-2xs"
                                                    >
                                                        <span>🔗</span>
                                                        <span>{res.title}</span>
                                                        <span className="text-[10px] text-slate-400">↗</span>
                                                    </a>
                                                ))
                                            ) : (
                                                <a
                                                    href={fallbackSearchUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition shadow-2xs"
                                                >
                                                    <span>🔍</span>
                                                    <span>Caută documentație pe Google</span>
                                                    <span className="text-[10px] text-slate-400">↗</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}