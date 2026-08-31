import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { QuestionForm } from '@/components/mentor/QuestionForm';
import { toggleQuestionActive } from '@/server/actions/questions';
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

const ORDINE_DIFICULTATE: Record<string, number> = {
    EASY: 1,
    MEDIUM: 2,
    HARD: 3,
};

const PAGE_SIZE = 10;

export default async function MentorQuestionsPage({
                                                      searchParams,
                                                  }: {
    searchParams: Promise<{ search?: string; category?: string; difficulty?: string; sort?: string; edit?: string; page?: string }>;
}) {
    const params = await searchParams;
    const search = params.search ?? '';
    const category = params.category ?? '';
    const difficulty = params.difficulty ?? '';
    const sort = params.sort ?? '';
    const editId = params.edit ? Number(params.edit) : null;
    const currentPage = Math.max(1, Number(params.page ?? '1') || 1);

    function buildUrl(newPage: number, newSort?: string) {
        const qs = new URLSearchParams();
        if (search) qs.set('search', search);
        if (category) qs.set('category', category);
        if (difficulty) qs.set('difficulty', difficulty);
        if (newSort !== undefined ? newSort : sort) {
            qs.set('sort', newSort !== undefined ? newSort : sort);
        }
        if (newPage > 1) qs.set('page', String(newPage));
        return `/questions?${qs.toString()}`;
    }

    const supabase = await createClient();

    let query = supabase
        .from('questions')
        .select('*, categories(name), question_options(id, option_text, is_correct)');

    if (search) {
        query = query.ilike('question_text', `%${search}%`);
    }
    if (category) {
        query = query.eq('category_id', Number(category));
    }
    if (difficulty) {
        query = query.eq('difficulty', difficulty);
    }

    const [{ data: questions, error }, { data: categories }] = await Promise.all([
        query,
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

    const listaSortata = [...(questions ?? [])].sort((a, b) => {
        if (sort === 'category') {
            return (a.categories?.name ?? '').localeCompare(b.categories?.name ?? '');
        }
        if (sort === 'difficulty') {
            return ORDINE_DIFICULTATE[a.difficulty] - ORDINE_DIFICULTATE[b.difficulty];
        }
        if (sort === 'name') {
            return a.question_text.localeCompare(b.question_text);
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const totalCount = listaSortata.length;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
    const fromIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedQuestions = listaSortata.slice(fromIndex, fromIndex + PAGE_SIZE);

    const intrebareEditata = editId ? questions?.find((q) => q.id === editId) : undefined;
    const areFiltre = search !== '' || category !== '' || difficulty !== '';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Catalog Întrebări</h1>
                <p className="text-sm text-slate-500">Gestionează întrebările oficiale din platformă.</p>
            </div>

            <Card>
                <h2 className="mb-4 text-base font-bold text-slate-900">
                    {intrebareEditata ? 'Editează întrebarea' : 'Adaugă întrebare nouă'}
                </h2>
                <QuestionForm categories={categories ?? []} question={intrebareEditata} />
            </Card>

            <Card className="bg-slate-50/60">
                <form className="flex flex-wrap items-end gap-3">
                    <div className="min-w-50 flex-1">
                        <label className="block text-sm font-medium text-slate-700">Caută</label>
                        <input
                            name="search"
                            defaultValue={search}
                            placeholder="Caută în enunț..."
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="min-w-45">
                        <label className="block text-sm font-medium text-slate-700">Categorie</label>
                        <select
                            name="category"
                            defaultValue={category}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">Toate</option>
                            {categories?.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-40">
                        <label className="block text-sm font-medium text-slate-700">Dificultate</label>
                        <select
                            name="difficulty"
                            defaultValue={difficulty}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">Toate</option>
                            <option value="EASY">Ușor</option>
                            <option value="MEDIUM">Mediu</option>
                            <option value="HARD">Greu</option>
                        </select>
                    </div>

                    <Button type="submit" variant="secondary">Filtrează</Button>
                    {areFiltre && (
                        <Link href="/questions" scroll={false} className="px-2 py-2 text-sm text-slate-500 hover:underline">
                            Resetează
                        </Link>
                    )}
                </form>
            </Card>

            <Card className="overflow-hidden p-0">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                    <tr>
                        <th className="whitespace-nowrap px-6 py-3">
                            <Link href={buildUrl(1, 'name')} scroll={false} className="hover:text-slate-800">
                                Enunț ↕
                            </Link>
                        </th>
                        <th className="whitespace-nowrap px-6 py-3">
                            <Link href={buildUrl(1, 'category')} scroll={false} className="hover:text-slate-800">
                                Categorie ↕
                            </Link>
                        </th>
                        <th className="whitespace-nowrap px-6 py-3">
                            <Link href={buildUrl(1, 'difficulty')} scroll={false} className="hover:text-slate-800">
                                Dificultate ↕
                            </Link>
                        </th>
                        <th className="px-6 py-3">Variante</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {paginatedQuestions.map((q) => (
                        <tr key={q.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900 max-w-md truncate">
                                {q.question_text}
                            </td>
                            <td className="px-6 py-4">{q.categories?.name ?? '—'}</td>
                            <td className="px-6 py-4">
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${DIFICULTATE_CULOARE[q.difficulty]}`}>
                                    {DIFICULTATE_LABEL[q.difficulty]}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {q.question_options.length} ({q.question_options.filter((o: any) => o.is_correct).length} corecte)
                            </td>
                            <td className="px-6 py-4">
                                {q.is_active ? (
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                        Activă
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                                        Inactivă
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                    <Link href={`/questions?edit=${q.id}`} scroll={false} className="text-indigo-600 hover:underline">
                                        Editează
                                    </Link>
                                    <form action={toggleQuestionActive} className="inline">
                                        <input type="hidden" name="id" value={q.id} />
                                        <input type="hidden" name="is_active" value={String(q.is_active)} />
                                        <button
                                            type="submit"
                                            className={
                                                q.is_active
                                                    ? 'text-slate-500 hover:text-slate-800 hover:underline'
                                                    : 'text-emerald-600 hover:underline'
                                            }
                                        >
                                            {q.is_active ? 'Dezactivează' : 'Activează'}
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {totalCount === 0 && (
                    <p className="px-6 py-8 text-center text-sm text-slate-500">
                        {areFiltre ? 'Nicio întrebare nu corespunde filtrelor.' : 'Nu există nicio întrebare încă.'}
                    </p>
                )}

                {/* Paginare cu scroll={false} */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
                        <p className="text-xs text-slate-500">
                            Afișez <span className="font-semibold text-slate-800">{fromIndex + 1}</span> -{' '}
                            <span className="font-semibold text-slate-800">
                                {Math.min(fromIndex + PAGE_SIZE, totalCount)}
                            </span> din <span className="font-semibold text-slate-800">{totalCount}</span> întrebări
                        </p>
                        <div className="flex items-center gap-2">
                            <Link
                                href={buildUrl(currentPage - 1)}
                                scroll={false}
                                className={`rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold ${
                                    currentPage <= 1
                                        ? 'pointer-events-none opacity-40 bg-slate-50 text-slate-400'
                                        : 'bg-white text-slate-700 hover:bg-slate-50 shadow-xs'
                                }`}
                            >
                                ← Înapoi
                            </Link>
                            <span className="px-2 text-xs font-bold text-slate-600">
                                {currentPage} / {totalPages}
                            </span>
                            <Link
                                href={buildUrl(currentPage + 1)}
                                scroll={false}
                                className={`rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold ${
                                    currentPage >= totalPages
                                        ? 'pointer-events-none opacity-40 bg-slate-50 text-slate-400'
                                        : 'bg-white text-slate-700 hover:bg-slate-50 shadow-xs'
                                }`}
                            >
                                Înainte →
                            </Link>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}