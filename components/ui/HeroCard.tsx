import React from 'react';

interface HeroCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function HeroCard({ children, className = '', ...props }: HeroCardProps) {
    return (
        <div
            className={`relative overflow-hidden rounded-2xl border border-indigo-100/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all dark:border-slate-700/50 dark:bg-slate-800/40 dark:shadow-none ${className}`}
            {...props}
        >
            {/* Efect subtil de strălucire */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl dark:bg-indigo-500/20" />
            {children}
        </div>
    );
}