import React from 'react';

export interface CategoryVisual {
    icon: React.ReactNode;
    bg: string;
    border: string;
    barColor: string;
    textColor: string;
}

export function getCategoryVisuals(name: string): CategoryVisual {
    const n = name.toLowerCase();

    if (n.includes('oop') || n.includes('programming')) {
        return {
            icon: (
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            ),
            bg: 'bg-emerald-50',
            border: 'border-t-emerald-500',
            barColor: 'bg-emerald-500',
            textColor: 'text-emerald-600',
        };
    }
    if (n.includes('git') || n.includes('version')) {
        return {
            icon: (
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            bg: 'bg-amber-50',
            border: 'border-t-amber-500',
            barColor: 'bg-amber-500',
            textColor: 'text-amber-600',
        };
    }
    if (n.includes('sql') || n.includes('data')) {
        return {
            icon: (
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
            ),
            bg: 'bg-blue-50',
            border: 'border-t-blue-500',
            barColor: 'bg-blue-500',
            textColor: 'text-blue-600',
        };
    }
    if (n.includes('clean') || n.includes('solid') || n.includes('pattern')) {
        return {
            icon: (
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            ),
            bg: 'bg-purple-50',
            border: 'border-t-purple-500',
            barColor: 'bg-purple-500',
            textColor: 'text-purple-600',
        };
    }
    return {
        icon: (
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        bg: 'bg-indigo-50',
        border: 'border-t-indigo-500',
        barColor: 'bg-indigo-500',
        textColor: 'text-indigo-600',
    };
}