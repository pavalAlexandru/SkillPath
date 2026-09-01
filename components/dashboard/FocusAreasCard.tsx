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
            {/* Cardul principal din Dashboard cu suport Glassmorphism & Dark Mode */}
            <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md transition-all dark:border-slate-800/80 dark:bg-slate-900/80">
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Arii de îmbunătățire</h3>
                            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Subiecte recente recomandate pentru aprofundare</p>
                        </div>
                        <span className="text-sm">💡</span>
                    </div>

                    <div className="space-y-3">
                        {focusAreas && focusAreas.length > 0 ? (
                            focusAreas.map((area) => {
                                const fallbackSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(area.topicTitle)}`;

                                return (
                                    <div
                                        key={area.id}
                                        className="space-y-2 rounded-xl border border-slate-200/60 bg-slate-50/70 p-3.5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-800/40"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                                    {area.categoryName}
                                                </span>
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{area.topicTitle}</h4>
                                            </div>
                                        </div>

                                        <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                                            {area.advice}
                                        </p>

                                        {/* Link-uri de Documentație & Căutare */}
                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                            {area.resources && area.resources.length > 0 ? (
                                                area.resources.map((res, rIdx) => (
                                                    <a
                                                        key={rIdx}
                                                        href={res.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-indigo-600 shadow-2xs transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400 dark:hover:border-indigo-600 dark:hover:bg-slate-700"
                                                    >
                                                        <span>🔗</span>
                                                        <span className="max-w-[190px] truncate">{res.title}</span>
                                                        <span className="text-[9px] text-slate-400 dark:text-slate-500">↗</span>
                                                    </a>
                                                ))
                                            ) : (
                                                <a
                                                    href={fallbackSearchUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-indigo-600 shadow-2xs transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400 dark:hover:border-indigo-600 dark:hover:bg-slate-700"
                                                >
                                                    <span>🔍</span>
                                                    <span>Caută pe Google</span>
                                                    <span className="text-[9px] text-slate-400 dark:text-slate-500">↗</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-center text-xs font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                                Felicitări! Nu ai arii slabe identificate în acest moment.
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Se deschid direct în tab nou</span>
                    {allRecommendations && allRecommendations.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="flex cursor-pointer items-center gap-1 text-xs font-bold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            Vezi toate recomandările ({allRecommendations.length}) &gt;
                        </button>
                    )}
                </div>
            </div>

            {/* Modal Pop-up: Istoric Complet Recomandări */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Modal */}
                        <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                            <div>
                                <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
                                    <span>📚</span> Istoric Recomandări & Resurse
                                </h2>
                                <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Toate subiectele recomandate pe baza evaluărilor tale anterioare
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="cursor-pointer rounded-xl p-2 text-sm font-bold leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                aria-label="Închide fereastra"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Listă Recomandări */}
                        <div className="flex-1 space-y-4 overflow-y-auto py-4 pr-1">
                            {allRecommendations.map((item) => {
                                const fallbackSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(item.topicTitle)}`;

                                return (
                                    <div
                                        key={item.id}
                                        className="space-y-2.5 rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-md border border-indigo-200/80 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/60 dark:text-indigo-300">
                                                        {item.categoryName}
                                                    </span>
                                                    {item.createdAt && (
                                                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                                            {item.createdAt}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{item.topicTitle}</h4>
                                            </div>
                                        </div>

                                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                            {item.advice}
                                        </p>

                                        {/* Resurse */}
                                        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200/60 pt-2 dark:border-slate-800">
                                            {item.resources && item.resources.length > 0 ? (
                                                item.resources.map((res, rIdx) => (
                                                    <a
                                                        key={rIdx}
                                                        href={res.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-2xs transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400 dark:hover:border-indigo-600 dark:hover:bg-slate-700"
                                                    >
                                                        <span>🔗</span>
                                                        <span>{res.title}</span>
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500">↗</span>
                                                    </a>
                                                ))
                                            ) : (
                                                <a
                                                    href={fallbackSearchUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-2xs transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400 dark:hover:border-indigo-600 dark:hover:bg-slate-700"
                                                >
                                                    <span>🔍</span>
                                                    <span>Caută documentație pe Google</span>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">↗</span>
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