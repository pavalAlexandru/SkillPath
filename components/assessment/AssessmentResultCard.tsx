import React from 'react';
import Link from 'next/link';
import { AssessmentResult } from '@/types/assesments';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
            <div className="flex justify-center gap-4">
                <Link href="/assessment">
                    <Button variant="primary">Înapoi la Teste</Button>
                </Link>
            </div>
        </Card>
    );
}