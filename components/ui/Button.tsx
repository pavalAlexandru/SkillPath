import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:focus:ring-indigo-400',
    secondary:
        'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:focus:ring-slate-600',
    outline:
        'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:focus:ring-slate-600',
    danger:
        'bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-500 dark:bg-rose-600 dark:hover:bg-rose-500 dark:focus:ring-rose-400',
    success:
        'bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:focus:ring-emerald-400',
};

export function Button({
    children,
    variant = 'primary',
    className = '',
    ...props
}: ButtonProps) {
    return (
        <button
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-950 ${variantStyles[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}