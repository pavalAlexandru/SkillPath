'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { createQuestion, updateQuestion } from '@/server/actions/questions';

type Optiune = { text: string; correct: boolean };

type ExistingQuestion = {
    id: number;
    question_text: string;
    category_id: number;
    difficulty: string;
    question_type: string;
    question_options: { option_text: string; is_correct: boolean }[];
};

export function QuestionForm({
                                 categories,
                                 question,
                                 returnTo = '/questions',
                             }: {
    categories: { id: number; name: string }[];
    question?: ExistingQuestion;
    returnTo?: string;
}) {
    const esteEditare = question !== undefined;

    const [tip, setTip] = useState<'SINGLE' | 'MULTIPLE'>(
        (question?.question_type as 'SINGLE' | 'MULTIPLE') ?? 'SINGLE',
    );
    const [optiuni, setOptiuni] = useState<Optiune[]>(
        question
            ? question.question_options.map((o) => ({ text: o.option_text, correct: o.is_correct }))
            : [
                { text: '', correct: false },
                { text: '', correct: false },
            ],
    );

    function adaugaOptiune() {
        setOptiuni([...optiuni, { text: '', correct: false }]);
    }

    function stergeOptiune(index: number) {
        setOptiuni(optiuni.filter((_, i) => i !== index));
    }

    function schimbaText(index: number, text: string) {
        setOptiuni(optiuni.map((o, i) => (i === index ? { ...o, text } : o)));
    }

    function schimbaCorect(index: number) {
        if (tip === 'SINGLE') {
            setOptiuni(optiuni.map((o, i) => ({ ...o, correct: i === index })));
        } else {
            setOptiuni(optiuni.map((o, i) => (i === index ? { ...o, correct: !o.correct } : o)));
        }
    }

    return (
        <form action={esteEditare ? updateQuestion : createQuestion} className="space-y-5">
            {esteEditare && <input type="hidden" name="question_id" value={question.id} />}
            {esteEditare && <input type="hidden" name="return_to" value={returnTo} />}
            {/* Enunț */}
            <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Enunț
                </label>
                <textarea
                    name="question_text"
                    required
                    minLength={5}
                    rows={2}
                    defaultValue={question?.question_text}
                    placeholder="Scrie enunțul întrebării..."
                    className="w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
            </div>

            {/* Rând: Categorie, Dificultate, Tip */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                {/* Categorie */}
                <div className="space-y-1.5 sm:col-span-6">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Categorie
                    </label>
                    <select
                        name="category_id"
                        required
                        defaultValue={question?.category_id}
                        className="w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                    >
                        {categories.map((c) => (
                            <option key={c.id} value={c.id} className="dark:bg-slate-900">
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Dificultate */}
                <div className="space-y-1.5 sm:col-span-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Dificultate
                    </label>
                    <select
                        name="difficulty"
                        defaultValue={question?.difficulty ?? 'EASY'}
                        className="w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                    >
                        <option value="EASY" className="dark:bg-slate-900">Ușor</option>
                        <option value="MEDIUM" className="dark:bg-slate-900">Mediu</option>
                        <option value="HARD" className="dark:bg-slate-900">Greu</option>
                    </select>
                </div>

                {/* Tip */}
                <div className="space-y-1.5 sm:col-span-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Tip
                    </label>
                    <select
                        name="question_type"
                        value={tip}
                        onChange={(e) => {
                            const newTip = e.target.value as 'SINGLE' | 'MULTIPLE';
                            setTip(newTip);
                            if (newTip === 'SINGLE') {
                                const firstCorrect = optiuni.findIndex((o) => o.correct);
                                setOptiuni(
                                    optiuni.map((opt, i) => ({
                                        ...opt,
                                        correct: i === (firstCorrect >= 0 ? firstCorrect : 0),
                                    })),
                                );
                            }
                        }}
                        className="w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                    >
                        <option value="SINGLE" className="dark:bg-slate-900">Un singur răspuns corect</option>
                        <option value="MULTIPLE" className="dark:bg-slate-900">Mai multe răspunsuri corecte</option>
                    </select>
                </div>
            </div>

            {/* Variante de răspuns */}
            <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Variante de răspuns
                </label>

                {optiuni.map((optiune, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <input
                            type={tip === 'SINGLE' ? 'radio' : 'checkbox'}
                            name="correct_option_selector"
                            checked={optiune.correct}
                            onChange={() => schimbaCorect(index)}
                            className={`h-4 w-4 cursor-pointer text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 ${
                                tip === 'MULTIPLE' ? 'rounded' : ''
                            }`}
                        />
                        <input
                            value={optiune.text}
                            onChange={(e) => schimbaText(index, e.target.value)}
                            required
                            placeholder={`Varianta ${index + 1}`}
                            className="flex-1 rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500"
                        />
                        {optiuni.length > 2 && (
                            <button
                                type="button"
                                onClick={() => stergeOptiune(index)}
                                className="cursor-pointer text-xs font-bold text-slate-400 transition hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
                                title="Șterge varianta"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}

                {optiuni.length < 6 && (
                    <button
                        type="button"
                        onClick={adaugaOptiune}
                        className="cursor-pointer text-xs font-bold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        + Adaugă variantă
                    </button>
                )}
            </div>

            <input type="hidden" name="options_json" value={JSON.stringify(optiuni)} />

            {/* Buton Salvare */}
            <div className="flex items-center gap-3 pt-2">
                <Button type="submit" variant="primary" className="px-6 py-2.5 text-xs font-bold shadow-xs">
                    {esteEditare ? 'Salvează modificările' : 'Salvează întrebarea'}
                </Button>
                {esteEditare && (
                    <a
                        href={returnTo}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                        Anulează
                    </a>
                )}
            </div>
        </form>
    );
}