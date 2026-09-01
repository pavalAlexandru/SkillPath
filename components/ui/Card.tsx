import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
    return (
        <div
            className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs backdrop-blur-md transition-all duration-150 dark:border-slate-800/80 dark:bg-slate-900/80 dark:text-slate-100 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}