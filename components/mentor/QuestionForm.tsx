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
}: {
    categories: { id: number; name: string }[];
    question?: ExistingQuestion;
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
        <form action={esteEditare ? updateQuestion : createQuestion} className="space-y-4">
            {esteEditare && <input type="hidden" name="question_id" value={question.id} />}

            <div>
                <label className="block text-sm font-medium text-slate-700">Enunț</label>
                <textarea
                    name="question_text"
                    required
                    minLength={5}
                    rows={2}
                    defaultValue={question?.question_text}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
            </div>

            <div className="flex gap-3">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700">Categorie</label>
                    <select
                        name="category_id"
                        required
                        defaultValue={question?.category_id}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Dificultate</label>
                    <select
                        name="difficulty"
                        defaultValue={question?.difficulty ?? 'EASY'}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                        <option value="EASY">Ușor</option>
                        <option value="MEDIUM">Mediu</option>
                        <option value="HARD">Greu</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Tip</label>
                    <select
                        name="question_type"
                        value={tip}
                        onChange={(e) => setTip(e.target.value as 'SINGLE' | 'MULTIPLE')}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                        <option value="SINGLE">Un singur răspuns corect</option>
                        <option value="MULTIPLE">Mai multe răspunsuri corecte</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Variante de răspuns</label>

                {optiuni.map((optiune, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input
                            type={tip === 'SINGLE' ? 'radio' : 'checkbox'}
                            checked={optiune.correct}
                            onChange={() => schimbaCorect(index)}
                            className="h-4 w-4"
                        />
                        <input
                            value={optiune.text}
                            onChange={(e) => schimbaText(index, e.target.value)}
                            required
                            placeholder={`Varianta ${index + 1}`}
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                        {optiuni.length > 2 && (
                            <button
                                type="button"
                                onClick={() => stergeOptiune(index)}
                                className="text-sm text-rose-600 hover:underline"
                            >
                                Șterge
                            </button>
                        )}
                    </div>
                ))}

                {optiuni.length < 6 && (
                    <button
                        type="button"
                        onClick={adaugaOptiune}
                        className="text-sm font-medium text-indigo-600 hover:underline"
                    >
                        + Adaugă variantă
                    </button>
                )}
            </div>

            <input type="hidden" name="options_json" value={JSON.stringify(optiuni)} />

            <div className="flex items-center gap-3">
                <Button type="submit" variant="primary">
                    {esteEditare ? 'Salvează modificările' : 'Salvează întrebarea'}
                </Button>
                {esteEditare && (
                    <a href="/questions" className="text-sm text-slate-500 hover:underline">
                        Anulează
                    </a>
                )}
            </div>
        </form>
    );
}
