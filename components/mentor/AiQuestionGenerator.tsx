'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { generateAiQuestions, type AiQuestionType } from '@/server/actions/ai-questions';

export function AiQuestionGenerator({ categories }: { categories: { id: number; name: string }[] }) {
    const router = useRouter();
    // '' = nicio categorie aleasă încă (opțiunea placeholder din select)
    const [categoryId, setCategoryId] = useState('');
    // Păstrăm textul brut ca să poată fi golit fără să sară la 0; convertim doar la trimitere
    const [countInput, setCountInput] = useState('3');
    const [questionType, setQuestionType] = useState<AiQuestionType>('MIXED');
    const [loading, setLoading] = useState(false);

    const count = Number(countInput);
    const countValid = countInput.trim() !== '' && Number.isInteger(count) && count >= 1 && count <= 5;
    const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

    async function genereaza() {
        setLoading(true);
        setMessage(null);
        const result = await generateAiQuestions({ categoryIds: [Number(categoryId)], count, questionType });
        setLoading(false);
        if ('error' in result) {

            setMessage({ type: 'err', text: result.error });
        } else {
            setMessage({ type: 'ok', text: `Am generat ${result.inserted} întrebări. Le găsești mai jos, în așteptare.` });
            router.refresh();
        }
    }

    return (
        <Card className="space-y-4 border border-indigo-100/90 bg-white/85 p-6 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
            <div>
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                    <span>✨</span> Generează întrebări cu AI
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Alege categoria; AI-ul propune enunțul, dificultatea și variantele. Le aprobi sau respingi mai jos.
                </p>
            </div>

            <div className="flex flex-wrap items-end gap-4">
                <div className="min-w-64 flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Categorie
                    </label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2 text-sm font-medium text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                    >
                        <option value="" className="dark:bg-slate-900">Alege o categorie...</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id} className="dark:bg-slate-900">
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="min-w-56">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Tip întrebări
                    </label>
                    <select
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value as AiQuestionType)}
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2 text-sm font-medium text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                    >
                        <option value="MIXED" className="dark:bg-slate-900">Mixt (aleator)</option>
                        <option value="SINGLE" className="dark:bg-slate-900">Un singur răspuns corect</option>
                        <option value="MULTIPLE" className="dark:bg-slate-900">Mai multe răspunsuri corecte</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Întrebări per categorie
                    </label>
                    <input
                        type="number" min={1} max={5} value={countInput}
                        onChange={(e) => setCountInput(e.target.value)}
                        className="mt-1.5 w-24 rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                    />
                </div>
                <Button type="button" onClick={genereaza} disabled={loading || categoryId === '' || !countValid} className="py-2.5 font-bold">
                    {loading ? 'Se generează...' : 'Generează cu AI'}
                </Button>
            </div>

            {!countValid && (
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">Alege un număr între 1 și 5.</p>
            )}

            {message && (
                <p className={`text-sm font-semibold ${message.type === 'ok' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                    {message.text}
                </p>
            )}
        </Card>
    );
}