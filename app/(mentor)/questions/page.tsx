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
    EASY: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    HARD: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
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
            <Card className="border-rose-200 bg-rose-50/90 dark:border-rose-900/60 dark:bg-rose-950/40">
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
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
        <div className="w-full space-y-6">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Catalog Întrebări</h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Gestionează întrebările oficiale din platformă.</p>
            </div>

            {/* Formular Glass Card */}
            <Card className="border border-indigo-100/90 bg-white/85 p-6 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-white">
                    {intrebareEditata ? 'Editează întrebarea' : 'Adaugă întrebare nouă'}
                </h2>
                <QuestionForm categories={categories ?? []} question={intrebareEditata} />
            </Card>

            {/* Filtre */}
            <Card className="border border-slate-200/80 bg-slate-50/70 p-5 backdrop-blur-md shadow-2xs dark:border-slate-800/80 dark:bg-slate-900/60">
                <form className="flex flex-wrap items-end gap-4">
                    <div className="min-w-50 flex-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Caută</label>
                        <input
                            name="search"
                            defaultValue={search}
                            placeholder="Caută în enunț..."
                            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500"
                        />
                    </div>

                    <div className="min-w-45">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Categorie</label>
                        <select
                            name="category"
                            defaultValue={category}
                            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                        >
                            <option value="" className="dark:bg-slate-900">Toate</option>
                            {categories?.map((c) => (
                                <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-40">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Dificultate</label>
                        <select
                            name="difficulty"
                            defaultValue={difficulty}
                            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                        >
                            <option value="" className="dark:bg-slate-900">Toate</option>
                            <option value="EASY" className="dark:bg-slate-900">Ușor</option>
                            <option value="MEDIUM" className="dark:bg-slate-900">Mediu</option>
                            <option value="HARD" className="dark:bg-slate-900">Greu</option>
                        </select>
                    </div>

                    <Button type="submit" variant="secondary" className="py-2.5 font-bold">Filtrează</Button>
                    {areFiltre && (
                        <Link href="/questions" scroll={false} className="px-2 py-2 text-xs font-semibold text-slate-500 hover:underline dark:text-slate-400">
                            Resetează
                        </Link>
                    )}
                </form>
            </Card>

            {/* Tabel */}
            <Card className="overflow-hidden border border-slate-200/80 bg-white/80 p-0 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                    <tr>
                        <th className="whitespace-nowrap px-6 py-3.5">
                            <Link href={buildUrl(1, 'name')} scroll={false} className="hover:text-slate-900 dark:hover:text-white">
                                Enunț ↕
                            </Link>
                        </th>
                        <th className="whitespace-nowrap px-6 py-3.5">
                            <Link href={buildUrl(1, 'category')} scroll={false} className="hover:text-slate-900 dark:hover:text-white">
                                Categorie ↕
                            </Link>
                        </th>
                        <th className="whitespace-nowrap px-6 py-3.5">
                            <Link href={buildUrl(1, 'difficulty')} scroll={false} className="hover:text-slate-900 dark:hover:text-white">
                                Dificultate ↕
                            </Link>
                        </th>
                        <th className="px-6 py-3.5">Variante</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedQuestions.map((q) => (
                        <tr key={q.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="max-w-md truncate px-6 py-4 font-bold text-slate-900 dark:text-white">
                                {q.question_text}
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{q.categories?.name ?? '—'}</td>
                            <td className="px-6 py-4">
                                <span
                                    className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${DIFICULTATE_CULOARE[q.difficulty]}`}
                                >
                                    {DIFICULTATE_LABEL[q.difficulty]}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                {q.question_options.length} ({q.question_options.filter((o: any) => o.is_correct).length} corecte)
                            </td>
                            <td className="px-6 py-4">
                                {q.is_active ? (
                                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300">
                                        Activă
                                    </span>
                                ) : (
                                    <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                        Inactivă
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                    <Link href={`/questions?edit=${q.id}`} scroll={false} className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                                        Editează
                                    </Link>
                                    <form action={toggleQuestionActive} className="inline">
                                        <input type="hidden" name="id" value={q.id} />
                                        <input type="hidden" name="is_active" value={String(q.is_active)} />
                                        <button
                                            type="submit"
                                            className={`cursor-pointer font-semibold transition hover:underline ${
                                                q.is_active
                                                    ? 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                                    : 'text-emerald-600 dark:text-emerald-400'
                                            }`}
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
                    <p className="px-6 py-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                        {areFiltre ? 'Nicio întrebare nu corespunde filtrelor.' : 'Nu există nicio întrebare încă.'}
                    </p>
                )}

                {/* Paginare cu scroll={false} */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/40">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Afișez <span className="font-bold text-slate-900 dark:text-white">{fromIndex + 1}</span> -{' '}
                            <span className="font-bold text-slate-900 dark:text-white">
                                {Math.min(fromIndex + PAGE_SIZE, totalCount)}
                            </span> din <span className="font-bold text-slate-900 dark:text-white">{totalCount}</span> întrebări
                        </p>
                        <div className="flex items-center gap-2">
                            <Link
                                href={buildUrl(currentPage - 1)}
                                scroll={false}
                                className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                                    currentPage <= 1
                                        ? 'pointer-events-none opacity-40 border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600'
                                        : 'border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                }`}
                            >
                                ← Înapoi
                            </Link>
                            <span className="px-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                                {currentPage} / {totalPages}
                            </span>
                            <Link
                                href={buildUrl(currentPage + 1)}
                                scroll={false}
                                className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                                    currentPage >= totalPages
                                        ? 'pointer-events-none opacity-40 border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600'
                                        : 'border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
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