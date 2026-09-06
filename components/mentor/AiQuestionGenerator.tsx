'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { generateAiQuestions, type AiQuestionType, type AiDifficulty } from '@/server/actions/ai-questions';
import { aiConfig } from '@/config/aiConfig';

const MAX_PER_LOT = aiConfig.maxQuestionsPerBatch;

// Aceleași clase pe select-uri și input, cu înălțime fixă, ca toate să stea pe aceeași linie
const CONTROL =
    'mt-1.5 h-10 rounded-xl border border-slate-300 bg-white/90 px-3.5 text-sm font-medium text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100';

export function AiQuestionGenerator({ categories }: { categories: { id: number; name: string }[] }) {
    const router = useRouter();
    // '' = nicio categorie aleasă încă (opțiunea placeholder din select)
    const [categoryId, setCategoryId] = useState('');
    // Păstrăm textul brut ca să poată fi golit fără să sară la 0; convertim doar la trimitere
    const [countInput, setCountInput] = useState('3');
    const [questionType, setQuestionType] = useState<AiQuestionType>('MIXED');
    const [difficulty, setDifficulty] = useState<AiDifficulty>('MIXED');
    const [loading, setLoading] = useState(false);

    const count = Number(countInput);
    const countValid = countInput.trim() !== '' && Number.isInteger(count) && count >= 1 && count <= MAX_PER_LOT;
    const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

    async function genereaza() {
        setLoading(true);
        setMessage(null);
        const result = await generateAiQuestions({ categoryIds: [Number(categoryId)], count, questionType, difficulty });
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
                    Alege categoria, tipul și dificultatea; AI-ul propune enunțul și variantele. Le aprobi sau respingi mai jos.
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
                        className={`${CONTROL} w-full`}
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
                        className={`${CONTROL} w-full`}
                    >
                        <option value="MIXED" className="dark:bg-slate-900">Mixt (aleator)</option>
                        <option value="SINGLE" className="dark:bg-slate-900">Un singur răspuns corect</option>
                        <option value="MULTIPLE" className="dark:bg-slate-900">Mai multe răspunsuri corecte</option>
                    </select>
                </div>

                <div className="min-w-40">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Dificultate
                    </label>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as AiDifficulty)}
                        className={`${CONTROL} w-full`}
                    >
                        <option value="MIXED" className="dark:bg-slate-900">Mixt (aleator)</option>
                        <option value="EASY" className="dark:bg-slate-900">Ușor</option>
                        <option value="MEDIUM" className="dark:bg-slate-900">Mediu</option>
                        <option value="HARD" className="dark:bg-slate-900">Greu</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Întrebări per categorie
                    </label>
                    <input
                        type="number" min={1} max={MAX_PER_LOT} value={countInput}
                        onChange={(e) => setCountInput(e.target.value)}
                        className={`${CONTROL} w-24`}
                    />
                </div>
                <Button type="button" onClick={genereaza} disabled={loading || categoryId === '' || !countValid} className="h-10 rounded-xl font-bold">
                    {loading ? 'Se generează...' : 'Generează cu AI'}
                </Button>
            </div>

            {!countValid && (
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">Alege un număr între 1 și {MAX_PER_LOT}.</p>
            )}

            {message && (
                <p className={`text-sm font-semibold ${message.type === 'ok' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                    {message.text}
                </p>
            )}
        </Card>
    );
}