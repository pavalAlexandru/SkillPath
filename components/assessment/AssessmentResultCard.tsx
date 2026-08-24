import React from 'react';
import Link from 'next/link';
import { AssessmentResult } from '@/types/assesments';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AIRecommendations } from './AIRecommendations';

interface AssessmentResultCardProps {
    assessmentId: string;
    result: AssessmentResult;
}

export function AssessmentResultCard({ assessmentId, result }: AssessmentResultCardProps) {
    return (
        <Card className="mx-auto max-w-2xl p-8 text-center space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">
                Rezultat Evaluare {assessmentId === 'surprise' ? 'Surpriză (Mixt)' : `#${assessmentId}`}
            </h2>
            <div className="rounded-xl bg-slate-50 p-6 border border-slate-100 space-y-2">
                <p className="text-4xl font-extrabold text-indigo-600">{result.percentage}%</p>
                <p className="text-sm text-slate-600">
                    Ai răspuns corect la {result.score} din {result.totalQuestions} întrebări.
                </p>
                <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        result.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}
                >
                    {result.passed ? 'PROMOVAT' : 'NECESITĂ REVIZUIRE'}
                </span>
            </div>
            
            {result.newId ? (
                <AIRecommendations assessmentId={result.newId} />
            ) : (
                <div className="p-6 text-center space-y-4 animate-pulse mt-8 border border-slate-100 rounded-xl bg-slate-50/50">
                    <div className="h-6 w-1/3 bg-slate-200 rounded mx-auto"></div>
                    <div className="h-4 w-3/4 bg-slate-200 rounded mx-auto"></div>
                    <p className="text-sm text-slate-500 font-medium">Se salvează rezultatele și se preiau detaliile...</p>
                </div>
            )}

            <div className="flex justify-center gap-4 mt-8">
                <Link href="/assessment">
                    <Button variant="primary">Înapoi la Teste</Button>
                </Link>
            </div>
        </Card>
    );
}