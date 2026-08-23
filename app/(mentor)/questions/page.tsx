import { Card } from '@/components/ui/Card';
import { QuestionForm } from '@/components/mentor/QuestionForm';
import { createClient } from '@/server/supabase/server';

export const dynamic = 'force-dynamic';

const DIFICULTATE_LABEL: Record<string, string> = {
    EASY: 'Ușor',
    MEDIUM: 'Mediu',
    HARD: 'Greu',
};

const DIFICULTATE_CULOARE: Record<string, string> = {
    EASY: 'bg-emerald-50 text-emerald-700',
    MEDIUM: 'bg-amber-50 text-amber-700',
    HARD: 'bg-rose-50 text-rose-700',
};

export default async function MentorQuestionsPage() {
    const supabase = await createClient();

    const [{ data: questions, error }, { data: categories }] = await Promise.all([
        supabase
            .from('questions')
            .select('*, categories(name), question_options(id, is_correct)')
            .order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name').eq('is_active', true).order('name'),
    ]);

    if (error) {
        return (
            <Card className="border-rose-200 bg-rose-50">
                <p className="text-sm text-rose-700">
                    Nu am putut încărca întrebările: {error.message}
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Catalog Întrebări</h1>
                <p className="text-sm text-slate-500">Gestionează întrebările oficiale din platformă.</p>
            </div>

            <Card>
                <h2 className="mb-4 text-base font-bold text-slate-900">Adaugă întrebare nouă</h2>
                <QuestionForm categories={categories ?? []} />
            </Card>

            <Card className="overflow-hidden p-0">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                    <tr>
                        <th className="px-6 py-3">Enunț</th>
                        <th className="px-6 py-3">Categorie</th>
                        <th className="px-6 py-3">Dificultate</th>
                        <th className="px-6 py-3">Variante</th>
                        <th className="px-6 py-3 text-right">Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {questions?.map((q) => (
                        <tr key={q.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900">
                                {q.question_text}
                            </td>
                            <td className="px-6 py-4">{q.categories?.name ?? '—'}</td>
                            <td className="px-6 py-4">
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${DIFICULTATE_CULOARE[q.difficulty]}`}
                                    >
                                        {DIFICULTATE_LABEL[q.difficulty]}
                                    </span>
                            </td>
                            <td className="px-6 py-4">
                                {q.question_options.length} ({q.question_options.filter((o) => o.is_correct).length} corecte)
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-indigo-600 hover:underline">Editează</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {questions?.length === 0 && (
                    <p className="px-6 py-8 text-center text-sm text-slate-500">
                        Nu există nicio întrebare încă.
                    </p>
                )}
            </Card>
        </div>
    );
}