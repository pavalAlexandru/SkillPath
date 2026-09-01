import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

export const metadata: Metadata = {
    title: 'SkillPath',
    description: 'Platformă de evaluare și învățare',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ro" suppressHydrationWarning>
        <body className="min-h-screen bg-slate-50 text-slate-900 antialiased transition-colors duration-200 dark:bg-[#090d16] dark:text-slate-100">
        <ThemeProvider>
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}