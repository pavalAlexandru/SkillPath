import React from 'react';
import Link from 'next/link';
import { getStudentDashboardData } from '@/server/supabase/dashboardService';

export default async function DashboardPage() {
    const data = await getStudentDashboardData();

    if (!data) {
        return (
            <div className="flex h-96 items-center justify-center text-slate-500 font-medium">
                Nu s-au putut încărca datele utilizatorului.
            </div>
        );
    }

    // Calcul puncte pentru graficul SVG
    const chartPoints = data.scoreHistory.map((item, index, arr) => {
        const x = arr.length > 1 ? (index / (arr.length - 1)) * 340 + 20 : 190;
        const y = 140 - (item.score / 100) * 110;
        return { x, y, ...item };
    });
    const svgPath = chartPoints.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-6">
            {/* Header Salut & Nivel */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black text-slate-900">Salut, {data.firstName}!</h1>
                        <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold tracking-wider text-indigo-700 uppercase">
                            {data.level}
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                        Bine ai revenit. Înregistrezi un progres constant!
                    </p>
                </div>
                <Link
                    href="/assessment"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    Start a test
                </Link>
            </div>

            {/* 4 Carduri de Statistici */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Teste completate */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tests completed
                    </div>
                    <div className="mt-3 text-2xl font-bold text-slate-900">{data.testsCompleted}</div>
                    <div className="mt-1 flex items-center text-[11px] font-medium text-emerald-600">
                        ↑ +{data.testsThisWeek} this week
                    </div>
                </div>

                {/* 2. Scor Mediu */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Average score
                    </div>
                    <div className="mt-3 text-2xl font-bold text-slate-900">{data.averageScore}%</div>
                    <div className="mt-1 flex items-center text-[11px] font-medium text-emerald-600">
                        ↑ +{data.scoreDiffVsMonth >= 0 ? data.scoreDiffVsMonth : 0}% vs last month
                    </div>
                </div>

                {/* 3. Categorii promovate */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Categories passed
                        </div>
                        {/* Indicator Circular Progres */}
                        <div className="relative h-6 w-6">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path
                                    className="text-indigo-600"
                                    strokeDasharray={`${data.totalCategories > 0 ? (data.categoriesPassed / data.totalCategories) * 100 : 0}, 100`}
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-3 text-2xl font-bold text-slate-900">
                        {data.categoriesPassed} <span className="text-sm font-normal text-slate-400">of {data.totalCategories}</span>
                    </div>
                </div>

                {/* 4. Streak */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="text-amber-500">🔥</span>
                        Current streak
                    </div>
                    <div className="mt-3 text-2xl font-bold text-slate-900">{data.currentStreak} days</div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <span>🎯</span> personal best
                    </div>
                </div>
            </div>

            {/* Secțiune: Continue Where You Left Off */}
            {data.inProgressTest ? (
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                CONTINUE WHERE YOU LEFT OFF
                            </span>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-slate-900">{data.inProgressTest.categoryName}</h3>
                                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                    {data.inProgressTest.level}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-48 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-indigo-600"
                                        style={{ width: `${(data.inProgressTest.answeredQuestions / data.inProgressTest.totalQuestions) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs font-medium text-slate-500">
                                    {data.inProgressTest.totalQuestions - data.inProgressTest.answeredQuestions} questions left
                                </span>
                            </div>
                        </div>
                        <Link
                            href={`/assessment/${data.inProgressTest.id}`}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                        >
                            Resume →
                        </Link>
                    </div>
                </div>
            ) : null}

            {/* Secțiune Grafic + Focus Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grafic: Score over time */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900">Score over time</h3>
                        <span className="text-slate-400 text-xs">•••</span>
                    </div>

                    {chartPoints.length > 0 ? (
                        <div className="relative w-full h-44">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 380 150">
                                {/* Linii fundal */}
                                <line x1="20" y1="30" x2="360" y2="30" stroke="#f1f5f9" strokeDasharray="3 3" />
                                <line x1="20" y1="85" x2="360" y2="85" stroke="#f1f5f9" strokeDasharray="3 3" />
                                <line x1="20" y1="140" x2="360" y2="140" stroke="#f1f5f9" strokeDasharray="3 3" />

                                {/* Traseu curbă */}
                                <path d={svgPath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />

                                {/* Puncte pe grafic */}
                                {chartPoints.map((pt, idx) => (
                                    <g key={idx}>
                                        <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="#6366f1" strokeWidth="2.5" />
                                        <text x={pt.x} y={pt.y - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">
                                            {pt.score}%
                                        </text>
                                    </g>
                                ))}
                            </svg>
                        </div>
                    ) : (
                        <div className="flex h-44 items-center justify-center text-xs text-slate-400">
                            Completează teste pentru a vizualiza evoluția scorului.
                        </div>
                    )}
                </div>

                {/* Focus Areas */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900">Focus Areas</h3>
                            <span className="text-slate-400 text-xs">🌐</span>
                        </div>

                        <div className="space-y-3">
                            {data.focusAreas.length > 0 ? (
                                data.focusAreas.map((area, idx) => (
                                    <div key={idx} className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                                        <div className="flex items-start gap-3">
                                            <span className="text-amber-500 text-sm">⚠️</span>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900">{area.topicTitle}</h4>
                                                <p className="mt-0.5 text-[11px] text-slate-500">
                                                    {area.advice}
                                                </p>
                                            </div>
                                        </div>
                                        <Link href="/assessment" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 whitespace-nowrap ml-2">
                                            Review &gt;
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-center text-xs text-emerald-800">
                                    Felicitări! Nu ai arii slabe identificate în acest moment.
                                </div>
                            )}
                        </div>
                    </div>

                    <Link
                        href="/assessment"
                        className="mt-4 block w-full rounded-xl border border-slate-200 py-2.5 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        View all recommendations
                    </Link>
                </div>
            </div>
        </div>
    );
}