import React from 'react';
import Link from 'next/link';

export function SurpriseModeBanner() {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-purple-50/80 p-7 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        <h2 className="text-xl font-bold text-slate-900">Modul Surpriză</h2>
                    </div>
                    <p className="max-w-2xl text-sm font-normal text-slate-600 leading-relaxed">
                        Testează-ți cunoștințele cu un mix personalizat de întrebări din toate categoriile active pentru a-ți identifica punctele slabe.
                    </p>
                </div>

                <Link
                    href="/assessment/surprise"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95 whitespace-nowrap"
                >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    Începe testul mixt
                </Link>
            </div>
        </div>
    );
}