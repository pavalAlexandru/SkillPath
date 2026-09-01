'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { proposeQuestionAction } from '@/server/actions/proposals';
import { CategoryRow } from '@/types/assesments';

export default function ProposeForm({ categories }: { categories: CategoryRow[] }) {
    const [categoryId, setCategoryId] = useState('');
    const [difficulty, setDifficulty] = useState('EASY');
    const [questionType, setQuestionType] = useState('SINGLE');
    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState([
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleOptionChange = (index: number, text: string) => {
        const newOptions = [...options];
        newOptions[index].text = text;
        setOptions(newOptions);
    };

    const handleCorrectChange = (index: number, isCorrect: boolean) => {
        const newOptions = [...options];
        if (questionType === 'SINGLE') {
            newOptions.forEach((opt, i) => (opt.isCorrect = i === index));
        } else {
            newOptions[index].isCorrect = isCorrect;
        }
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            const res = await proposeQuestionAction({
                categoryId: Number(categoryId),
                difficulty,
                questionType,
                questionText,
                options,
            });

            if (res?.error) {
                setMessage({ type: 'error', text: res.error });
            } else {
                setMessage({
                    type: 'success',
                    text: 'Întrebarea a fost propusă cu succes și așteaptă aprobarea!',
                });
                setCategoryId('');
                setQuestionText('');
                setOptions([
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                ]);
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'A apărut o eroare la salvarea propunerii.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <div
                    className={`rounded-xl border p-4 text-xs font-bold leading-relaxed ${
                        message.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
                    }`}
                >
                    {message.text}
                </div>
            )}

            {/* Categorie */}
            <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Categorie
                </label>
                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                    required
                >
                    <option value="" className="dark:bg-slate-900">Selectează o categorie</option>
                    {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id} className="dark:bg-slate-900">
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Dificultate */}
            <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Dificultate
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                        <label key={level} className="cursor-pointer">
                            <input
                                type="radio"
                                name="difficulty"
                                value={level}
                                checked={difficulty === level}
                                onChange={() => setDifficulty(level)}
                                className="peer sr-only"
                            />
                            <div className="rounded-xl border border-slate-200 bg-white py-2.5 text-center text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:peer-checked:border-indigo-500 dark:peer-checked:bg-indigo-950/60 dark:peer-checked:text-indigo-300">
                                {level === 'EASY' ? 'Ușor' : level === 'MEDIUM' ? 'Mediu' : 'Greu'}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Tip întrebare */}
            <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Tip întrebare
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <label className="cursor-pointer">
                        <input
                            type="radio"
                            name="questionType"
                            value="SINGLE"
                            checked={questionType === 'SINGLE'}
                            onChange={() => {
                                setQuestionType('SINGLE');
                                const correctIdx = options.findIndex((o) => o.isCorrect);
                                const newOptions = options.map((opt, i) => ({
                                    ...opt,
                                    isCorrect: i === (correctIdx >= 0 ? correctIdx : 0),
                                }));
                                setOptions(newOptions);
                            }}
                            className="peer sr-only"
                        />
                        <div className="rounded-xl border border-slate-200 bg-white py-2.5 text-center text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:peer-checked:border-indigo-500 dark:peer-checked:bg-indigo-950/60 dark:peer-checked:text-indigo-300">
                            Răspuns Unic
                        </div>
                    </label>
                    <label className="cursor-pointer">
                        <input
                            type="radio"
                            name="questionType"
                            value="MULTIPLE"
                            checked={questionType === 'MULTIPLE'}
                            onChange={() => setQuestionType('MULTIPLE')}
                            className="peer sr-only"
                        />
                        <div className="rounded-xl border border-slate-200 bg-white py-2.5 text-center text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:peer-checked:border-indigo-500 dark:peer-checked:bg-indigo-950/60 dark:peer-checked:text-indigo-300">
                            Răspuns Multiplu
                        </div>
                    </label>
                </div>
            </div>

            {/* Enunțul Întrebării */}
            <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Enunțul Întrebării
                </label>
                <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    rows={3}
                    placeholder="Scrie textul întrebării..."
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
            </div>

            {/* Opțiuni de Răspuns */}
            <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Opțiuni de Răspuns (bifează varianta corectă)
                </label>
                {options.map((opt, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <input
                            type={questionType === 'SINGLE' ? 'radio' : 'checkbox'}
                            name="correctOption"
                            checked={opt.isCorrect}
                            onChange={(e) => handleCorrectChange(index, e.target.checked)}
                            className={`h-4 w-4 cursor-pointer text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 ${
                                questionType === 'MULTIPLE' ? 'rounded' : ''
                            }`}
                        />
                        <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Opțiunea ${index + 1}`}
                            required
                            className="flex-1 rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500"
                        />
                    </div>
                ))}
            </div>

            <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full py-3 text-xs font-bold shadow-xs"
            >
                {loading ? 'Se trimite...' : 'Trimite spre aprobare'}
            </Button>
        </form>
    );
}