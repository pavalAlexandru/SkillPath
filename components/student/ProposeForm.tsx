'use client';

import { useState } from 'react';
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
        { text: '', isCorrect: false }
    ]);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleOptionChange = (index: number, text: string) => {
        const newOptions = [...options];
        newOptions[index].text = text;
        setOptions(newOptions);
    };

    const handleCorrectChange = (index: number, isCorrect: boolean) => {
        const newOptions = [...options];
        if (questionType === 'SINGLE') {
            newOptions.forEach((opt, i) => opt.isCorrect = i === index);
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
                options
            });

            if (res?.error) {
                setMessage({ type: 'error', text: res.error });
            } else {
                setMessage({ type: 'success', text: 'Întrebarea a fost propusă cu succes și așteaptă aprobarea!' });
                setCategoryId('');
                setQuestionText('');
                setOptions([
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false }
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
                <div className={`p-4 rounded-md text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-700">Categorie</label>
                <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                >
                    <option value="">Selectează o categorie</option>
                    {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Dificultate</label>
                <div className="flex space-x-4">
                    {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                        <label key={level} className="flex-1 cursor-pointer">
                            <input 
                                type="radio" 
                                name="difficulty" 
                                value={level} 
                                checked={difficulty === level}
                                onChange={() => setDifficulty(level)}
                                className="peer sr-only" 
                            />
                            <div className="rounded-md border border-slate-300 py-2 text-center text-sm font-medium text-slate-700 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 hover:bg-slate-50 transition-colors">
                                {level === 'EASY' ? 'Ușor' : level === 'MEDIUM' ? 'Mediu' : 'Greu'}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tip întrebare</label>
                <div className="flex space-x-4">
                    <label className="flex-1 cursor-pointer">
                        <input 
                            type="radio" 
                            name="questionType" 
                            value="SINGLE" 
                            checked={questionType === 'SINGLE'}
                            onChange={() => {
                                setQuestionType('SINGLE');
                                const correctIdx = options.findIndex(o => o.isCorrect);
                                const newOptions = options.map((opt, i) => ({ ...opt, isCorrect: i === (correctIdx >= 0 ? correctIdx : 0) }));
                                setOptions(newOptions);
                            }}
                            className="peer sr-only" 
                        />
                        <div className="rounded-md border border-slate-300 py-2 text-center text-sm font-medium text-slate-700 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 hover:bg-slate-50 transition-colors">
                            Răspuns Unic
                        </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input 
                            type="radio" 
                            name="questionType" 
                            value="MULTIPLE" 
                            checked={questionType === 'MULTIPLE'}
                            onChange={() => setQuestionType('MULTIPLE')}
                            className="peer sr-only" 
                        />
                        <div className="rounded-md border border-slate-300 py-2 text-center text-sm font-medium text-slate-700 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 hover:bg-slate-50 transition-colors">
                            Răspuns Multiplu
                        </div>
                    </label>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Enunțul Întrebării</label>
                <textarea
                    value={questionText}
                    onChange={e => setQuestionText(e.target.value)}
                    rows={3}
                    placeholder="Scrie textul întrebării..."
                    required
                    className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>

            <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Opțiuni de Răspuns</label>
                {options.map((opt, index) => (
                    <div key={index} className="flex items-center space-x-3">
                        <input
                            type={questionType === 'SINGLE' ? 'radio' : 'checkbox'}
                            name="correctOption"
                            checked={opt.isCorrect}
                            onChange={(e) => handleCorrectChange(index, e.target.checked)}
                            className="h-5 w-5 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Opțiunea ${index + 1}`}
                            required
                            className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                ))}
            </div>

            <Button type="submit" variant="primary" disabled={loading} className="w-full">
                {loading ? 'Se trimite...' : 'Trimite spre aprobare'}
            </Button>
        </form>
    );
}
