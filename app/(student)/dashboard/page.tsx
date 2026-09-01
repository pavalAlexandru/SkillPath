import React from 'react';
import Link from 'next/link';
import { getStudentDashboardData, CategorySkill } from '@/server/supabase/dashboardService';
import { FocusAreasCard } from '@/components/dashboard/FocusAreasCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function generateRadarPolygon(skills: CategorySkill[], center: number, radius: number) {
    const total = skills.length;
    if (total === 0) return { polygonPoints: '', axisPoints: [], gridPolygons: [] };

    const axisPoints = skills.map((skill, i) => {
        const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);

        const valRadius = radius * (Math.max(skill.score, 8) / 100);
        const vx = center + valRadius * Math.cos(angle);
        const vy = center + valRadius * Math.sin(angle);

        return { x, y, vx, vy, name: skill.name, score: skill.score, angle };
    });

    const polygonPoints = axisPoints.map(p => `${p.vx},${p.vy}`).join(' ');

    const gridPolygons = [0.33, 0.66, 1.0].map(level => {
        return skills.map((_, i) => {
            const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
            const gx = center + (radius * level) * Math.cos(angle);
            const gy = center + (radius * level) * Math.sin(angle);
            return `${gx},${gy}`;
        }).join(' ');
    });

    return { polygonPoints, axisPoints, gridPolygons };
}

export default async function DashboardPage() {
    const data = await getStudentDashboardData();

    if (!data) {
        return (
            <div className="flex h-96 items-center justify-center font-medium text-slate-500 dark:text-slate-400">
                Nu s-au putut încărca datele utilizatorului.
            </div>
        );
    }

    const chartPoints = data.scoreHistory.map((item, index, arr) => {
        const total = arr.length;
        const x = total > 1 ? (index / (total - 1)) * 300 + 45 : 190;
        const y = 155 - (item.score / 100) * 120;
        return { x, y, ...item };
    });

    const svgLinePath = chartPoints.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
    const svgAreaPath = chartPoints.length > 0
        ? `${svgLinePath} L ${chartPoints[chartPoints.length - 1].x} 155 L ${chartPoints[0].x} 155 Z`
        : '';

    const { polygonPoints, axisPoints, gridPolygons } = generateRadarPolygon(data.skillsRadar, 110, 70);

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6">
            {/* Header: Salut & Nivel */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            Salut, {data.firstName}!
                        </h1>
                        <span className="rounded-md border border-indigo-200/80 bg-indigo-50 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:border-indigo-800/80 dark:bg-indigo-950/60 dark:text-indigo-300">
                            {data.level}
                        </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                        Bine ai revenit. Înregistrezi un progres constant!
                    </p>
                </div>
                <Link
                    href="/assessment"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-indigo-500"
                >
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    Începe un test
                </Link>
            </div>

            {/* 1. Traseu de carieră (Hero Glassmorphism) */}
            <div className="relative overflow-hidden rounded-2xl border border-indigo-100/90 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-slate-900/60 dark:to-indigo-950/40">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                Traseu de carieră
                            </span>
                            <span className="rounded-md border border-indigo-200/60 bg-indigo-100/80 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:border-indigo-800/60 dark:bg-indigo-900/50 dark:text-indigo-300">
                                {data.level} ➔ {data.nextLevel}
                            </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Ai promovat {data.categoriesPassed} din {data.totalCategories} categorii ({data.levelProgressPercentage}%)
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Obține un scor de minim 90% la toate cele {data.totalCategories} categorii pentru a promova la nivelul <strong className="text-slate-800 dark:text-slate-200">{data.nextLevel}</strong>.
                        </p>
                    </div>
                    <div className="shrink-0 text-right">
                        <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                            {data.levelProgressPercentage}%
                        </span>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Progres Nivel
                        </div>
                    </div>
                </div>

                <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full border border-slate-200/60 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-800/60">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-2xs transition-all duration-500"
                        style={{ width: `${Math.max(data.levelProgressPercentage, 4)}%` }}
                    />
                </div>
            </div>

            {/* 4 Carduri de Statistici */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <svg className="h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Teste finalizate
                    </div>
                    <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{data.testsCompleted}</div>
                    <div className="mt-1 flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        ↑ +{data.testsThisWeek} săptămâna aceasta
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <svg className="h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Scor mediu
                    </div>
                    <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{data.averageScore}%</div>
                    <div className="mt-1 flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        ↑ +{data.scoreDiffVsMonth >= 0 ? data.scoreDiffVsMonth : 0}% față de luna trecută
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                            <svg className="h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Categorii promovate
                        </div>
                        <div className="relative h-6 w-6">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-200 dark:text-slate-800" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path
                                    className="text-indigo-600 dark:text-indigo-400"
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
                    <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                        {data.categoriesPassed} <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">din {data.totalCategories}</span>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span className="text-amber-500">{data.currentStreak > 0 ? '🔥' : '⏳'}</span>
                        Zile consecutive
                    </div>
                    <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                        {data.currentStreak} {data.currentStreak === 1 ? 'zi' : 'zile'}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        {data.currentStreak > 0 ? (
                            <>
                                <span>🎯</span> serie activă
                            </>
                        ) : (
                            <span>💡 rezolvă un test azi</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Secțiune: Evoluție Scor + Arii de Îmbunătățire */}
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
                <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
                    <div className="mb-2 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Evoluția scorului</h3>
                            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Performanța la ultimele evaluări</p>
                        </div>
                        <span className="rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:border-indigo-800/60 dark:bg-indigo-950/60 dark:text-indigo-300">
                            Scor mediu: {data.averageScore}%
                        </span>
                    </div>

                    {chartPoints.length > 0 ? (
                        <div className="relative my-auto flex min-h-[220px] w-full flex-1 items-center justify-center py-4">
                            <svg className="h-full max-h-[240px] w-full overflow-visible" viewBox="0 0 380 180">
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>

                                {/* Linii ghidaj */}
                                <line x1="40" y1="35" x2="355" y2="35" className="stroke-slate-200 dark:stroke-slate-800" strokeDasharray="4 4" strokeWidth="1.5" />
                                <text x="32" y="38" textAnchor="end" fontSize="10" className="fill-slate-400 dark:fill-slate-500" fontWeight="700">100%</text>

                                <line x1="40" y1="95" x2="355" y2="95" className="stroke-slate-100 dark:stroke-slate-800/60" strokeDasharray="4 4" strokeWidth="1.5" />
                                <text x="32" y="98" textAnchor="end" fontSize="10" className="fill-slate-300 dark:fill-slate-600" fontWeight="700">50%</text>

                                <line x1="40" y1="155" x2="355" y2="155" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="1.5" />
                                <text x="32" y="158" textAnchor="end" fontSize="10" className="fill-slate-400 dark:fill-slate-500" fontWeight="700">0%</text>

                                {svgAreaPath && (
                                    <path d={svgAreaPath} fill="url(#scoreGradient)" />
                                )}

                                <path
                                    d={svgLinePath}
                                    fill="none"
                                    className="stroke-indigo-600 dark:stroke-indigo-400"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {chartPoints.map((pt, idx) => (
                                    <g key={idx}>
                                        <circle cx={pt.x} cy={pt.y} r="5.5" className="fill-white stroke-indigo-600 dark:fill-slate-900 dark:stroke-indigo-400" strokeWidth="3" />
                                        <text
                                            x={pt.x}
                                            y={pt.y - 10}
                                            textAnchor="middle"
                                            fontSize="11"
                                            fontWeight="bold"
                                            className="fill-slate-900 dark:fill-white"
                                        >
                                            {pt.score}%
                                        </text>
                                        <text
                                            x={pt.x}
                                            y={172}
                                            textAnchor="middle"
                                            fontSize="10"
                                            fontWeight="600"
                                            className="fill-slate-500 dark:fill-slate-400"
                                        >
                                            {pt.date}
                                        </text>
                                    </g>
                                ))}
                            </svg>
                        </div>
                    ) : (
                        <div className="flex flex-1 items-center justify-center py-10 text-xs font-medium text-slate-400 dark:text-slate-500">
                            Completează teste pentru a vizualiza evoluția scorului.
                        </div>
                    )}
                </div>

                <FocusAreasCard
                    focusAreas={data.focusAreas}
                    allRecommendations={data.allRecommendations}
                />
            </div>

            {/* Secțiuni: Radar Competențe + Acuratețe Dificultăți */}
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
                    <div className="mb-2 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Harta Competențelor</h3>
                            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Nivelul de cunoștințe ({data.skillsRadar.length} categorii active)</p>
                        </div>
                        <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-600 dark:border-indigo-800/60 dark:bg-indigo-950/60 dark:text-indigo-300">
                            Nivel {data.level}
                        </span>
                    </div>

                    <div className="relative flex h-56 items-center justify-center">
                        <svg className="h-full w-full max-w-[280px] overflow-visible" viewBox="0 0 220 220">
                            {gridPolygons.map((pts, i) => (
                                <polygon
                                    key={i}
                                    points={pts}
                                    fill="none"
                                    className="stroke-slate-200 dark:stroke-slate-800"
                                    strokeWidth="1.5"
                                    strokeDasharray={i < 2 ? '3 3' : 'none'}
                                />
                            ))}

                            {axisPoints.map((p, i) => (
                                <line key={i} x1="110" y1="110" x2={p.x} y2={p.y} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="1" />
                            ))}

                            {polygonPoints && (
                                <polygon
                                    points={polygonPoints}
                                    fill="rgba(99, 102, 241, 0.25)"
                                    className="stroke-indigo-600 dark:stroke-indigo-400"
                                    strokeWidth="2.5"
                                />
                            )}

                            {axisPoints.map((p, i) => {
                                const isTop = p.y < 80;
                                const isBottom = p.y > 140;
                                const isRight = p.x > 120;
                                const isLeft = p.x < 100;

                                let anchor: 'start' | 'middle' | 'end' = 'middle';
                                let dx = 0;
                                let dy = 0;

                                if (isTop) dy = -10;
                                else if (isBottom) dy = 14;

                                if (isRight && !isTop && !isBottom) { anchor = 'start'; dx = 8; }
                                else if (isLeft && !isTop && !isBottom) { anchor = 'end'; dx = -8; }

                                return (
                                    <g key={i}>
                                        <circle cx={p.vx} cy={p.vy} r="4" className="fill-indigo-600 stroke-white dark:fill-indigo-400 dark:stroke-slate-900" strokeWidth="1.5" />
                                        <text
                                            x={p.x + dx}
                                            y={p.y + dy}
                                            textAnchor={anchor}
                                            fontSize="9"
                                            fontWeight="bold"
                                            className="fill-slate-700 dark:fill-slate-300"
                                        >
                                            {p.name} ({p.score}%)
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Acuratețe pe Dificultăți</h3>
                            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Rata de răspunsuri corecte per nivel</p>
                        </div>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Statistici</span>
                    </div>

                    <div className="my-auto space-y-5 py-2">
                        {/* Ușor */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Ușor (Easy)
                                </span>
                                <span className="text-slate-900 dark:text-white">{data.difficultyAccuracy.easy}%</span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                    style={{ width: `${data.difficultyAccuracy.easy}%` }}
                                />
                            </div>
                        </div>

                        {/* Mediu */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <span className="h-2 w-2 rounded-full bg-amber-500"></span> Mediu (Medium)
                                </span>
                                <span className="text-slate-900 dark:text-white">{data.difficultyAccuracy.medium}%</span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div
                                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                                    style={{ width: `${data.difficultyAccuracy.medium}%` }}
                                />
                            </div>
                        </div>

                        {/* Dificil */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <span className="h-2 w-2 rounded-full bg-rose-500"></span> Dificil (Hard)
                                </span>
                                <span className="text-slate-900 dark:text-white">{data.difficultyAccuracy.hard}%</span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div
                                    className="h-full rounded-full bg-rose-500 transition-all duration-500"
                                    style={{ width: `${data.difficultyAccuracy.hard}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activitate Săptămânală + Insigne */}
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Activitate Săptămânală</h3>
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Ultimele 7 zile</span>
                        </div>
                        <p className="mb-4 text-[11px] font-medium text-slate-400 dark:text-slate-500">Consistența este cheia spre succes</p>

                        <div className="grid grid-cols-7 gap-2 text-center">
                            {data.weeklyActivity.map((day, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{day.dayName}</span>
                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold shadow-2xs transition-all ${
                                            day.count > 0
                                                ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none'
                                                : 'border border-slate-200/60 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-500'
                                        }`}
                                        title={`${day.date}: ${day.count} teste`}
                                    >
                                        {day.count > 0 ? day.count : '•'}
                                    </div>
                                    <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">{day.date.split(' ')[0]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        <span>Total teste: <strong className="text-slate-900 dark:text-white">{data.testsThisWeek}</strong></span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Activitate constantă 🔥</span>
                    </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 lg:col-span-2">
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Insigne & Realizări</h3>
                            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                                {data.achievements.filter(a => a.unlocked).length} din {data.achievements.length} deblocate
                            </span>
                        </div>
                        <p className="mb-4 text-[11px] font-medium text-slate-400 dark:text-slate-500">Completează provocări pentru a debloca recompense</p>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {data.achievements.map((badge) => (
                                <div
                                    key={badge.id}
                                    className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                                        badge.unlocked
                                            ? 'border-amber-200/80 bg-gradient-to-r from-amber-50/60 to-white shadow-2xs dark:border-amber-900/40 dark:from-amber-950/20 dark:to-slate-900'
                                            : 'border-slate-200/60 bg-slate-50/50 opacity-60 dark:border-slate-800/60 dark:bg-slate-800/30'
                                    }`}
                                >
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                                        badge.unlocked ? 'bg-amber-100 text-amber-700 shadow-inner dark:bg-amber-900/50 dark:text-amber-300' : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                                    }`}>
                                        {badge.unlocked ? badge.icon : '🔒'}
                                    </div>
                                    <div>
                                        <h4 className={`text-xs font-bold ${badge.unlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {badge.title}
                                        </h4>
                                        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{badge.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}