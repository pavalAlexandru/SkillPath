import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createCategory, updateCategory, toggleCategoryActive } from '@/server/actions/categories';
import { supabase } from '@/server/supabase';

const LEVEL_STYLES: Record<string, string> = {
    JUNIOR: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    MIDDLE: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    SENIOR: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
};

const ORDINE_NIVEL: Record<string, number> = {
    JUNIOR: 1,
    MIDDLE: 2,
    SENIOR: 3,
};

export default async function CategoriesPage({
                                                 searchParams,
                                             }: {
    searchParams: Promise<{ search?: string; status?: string; edit?: string; sort?: string; level?: string }>;
}) {
    const params = await searchParams;
    const search = params.search ?? '';
    const status = params.status ?? 'all';
    const sort = params.sort ?? '';
    const level = params.level ?? '';
    const editId = params.edit ? Number(params.edit) : null;

    function sortLink(field: string) {
        const qs = new URLSearchParams();
        if (search) qs.set('search', search);
        if (status !== 'all') qs.set('status', status);
        if (level) qs.set('level', level);
        qs.set('sort', field);
        return `/categories?${qs.toString()}`;
    }

    const { data: editing } = editId
        ? await supabase.from('categories').select('*').eq('id', editId).single()
        : { data: null };

    let query = supabase.from('categories').select('*').order('name');
    if (search) {
        query = query.ilike('name', `%${search}%`);
    }

    if (status === 'active') {
        query = query.eq('is_active', true);
    } else if (status === 'inactive') {
        query = query.eq('is_active', false);
    }

    if (level) {
        query = query.eq('level', level);
    }

    const { data: categories, error } = await query;

    if (error) {
        return (
            <Card className="border-rose-200 bg-rose-50/90 dark:border-rose-900/60 dark:bg-rose-950/40">
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                    Nu am putut încărca categoriile: {error.message}
                </p>
            </Card>
        );
    }

    const listaOrdonata = [...(categories ?? [])].sort((a, b) => {
        if (sort === 'level') {
            return ORDINE_NIVEL[a.level] - ORDINE_NIVEL[b.level];
        }
        return 0;
    });

    const areFiltre = search !== '' || status !== 'all' || level !== '';

    return (
        <div className="w-full space-y-6">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Catalog Categorii</h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Gestionează domeniile pe care se dau evaluările.
                </p>
            </div>

            {/* Formular Adăugare / Editare Glass Card */}
            <Card className="border border-indigo-100/90 bg-white/85 p-6 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                <form
                    key={editing?.id ?? 'new'}
                    action={editing ? updateCategory : createCategory}
                    className="flex flex-wrap items-end gap-4"
                >
                    {editing && <input type="hidden" name="id" value={editing.id} />}

                    <div className="min-w-50 flex-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Nume</label>
                        <input
                            name="name"
                            required
                            minLength={2}
                            defaultValue={editing?.name ?? ''}
                            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white/80 px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                        />
                    </div>

                    <div className="min-w-60 flex-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Descriere</label>
                        <input
                            name="description"
                            defaultValue={editing?.description ?? ''}
                            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white/80 px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                        />
                    </div>
                    <div className="min-w-40">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Nivel</label>
                        <select
                            name="level"
                            defaultValue={editing?.level ?? 'JUNIOR'}
                            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white/80 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                        >
                            <option value="JUNIOR">Junior</option>
                            <option value="MIDDLE">Middle</option>
                            <option value="SENIOR">Senior</option>
                        </select>
                    </div>
                    <Button type="submit" className="py-2.5 font-bold">{editing ? 'Salvează' : 'Adaugă'}</Button>

                    {editing && (
                        <a
                            href="/categories"
                            className="px-2 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            Anulează
                        </a>
                    )}
                </form>
            </Card>

            {/* Filtre */}
            <Card className="border border-slate-200/80 bg-slate-50/70 p-5 backdrop-blur-md shadow-2xs dark:border-slate-800/80 dark:bg-slate-900/60">
                <form className="flex flex-wrap items-end gap-4">
                    <div className="min-w-50 flex-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Caută</label>
                        <input
                            name="search"
                            defaultValue={search}
                            placeholder="Nume categorie..."
                            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                        />
                    </div>

                    <div className="min-w-40">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Status</label>
                        <select
                            name="status"
                            defaultValue={status}
                            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                        >
                            <option value="all">Toate</option>
                            <option value="active">Doar active</option>
                            <option value="inactive">Doar inactive</option>
                        </select>
                    </div>

                    <div className="min-w-40">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Nivel</label>
                        <select
                            name="level"
                            defaultValue={level}
                            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                        >
                            <option value="">Toate</option>
                            <option value="JUNIOR">Junior</option>
                            <option value="MIDDLE">Middle</option>
                            <option value="SENIOR">Senior</option>
                        </select>
                    </div>

                    <Button type="submit" variant="secondary" className="py-2.5 font-bold">Filtrează</Button>

                    {areFiltre && (
                        <a
                            href="/categories"
                            className="px-2 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            Resetează
                        </a>
                    )}
                </form>
            </Card>

            {/* Tabel categorii */}
            <Card className="overflow-hidden border border-slate-200/80 bg-white/80 p-0 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                    <tr>
                        <th className="px-6 py-3.5">Nume</th>
                        <th className="px-6 py-3.5">Descriere</th>
                        <th className="whitespace-nowrap px-6 py-3.5">
                            <a href={sortLink('level')} className="hover:text-slate-900 dark:hover:text-white">
                                Level ↕
                            </a>
                        </th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {listaOrdonata.map((category) => (
                        <tr key={category.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                {category.name}
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{category.description ?? '—'}</td>
                            <td className="px-6 py-4">
                                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${LEVEL_STYLES[category.level] ?? ''}`}>
                                        {category.level}
                                    </span>
                            </td>
                            <td className="px-6 py-4">
                                {category.is_active ? (
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
                                <div className="flex items-center justify-end gap-4">
                                    <a href={`/categories?edit=${category.id}`} className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                                        Editează
                                    </a>
                                    <form action={toggleCategoryActive} className="inline">
                                        <input type="hidden" name="id" value={category.id} />
                                        <input type="hidden" name="is_active" value={String(category.is_active)} />
                                        <button
                                            type="submit"
                                            className={`font-semibold transition hover:underline ${
                                                category.is_active
                                                    ? 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                                    : 'text-emerald-600 dark:text-emerald-400'
                                            }`}
                                        >
                                            {category.is_active ? 'Dezactivează' : 'Activează'}
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {categories?.length === 0 && (
                    <p className="px-6 py-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                        {areFiltre
                            ? 'Nicio categorie nu corespunde filtrelor.'
                            : 'Nu există nicio categorie încă.'}
                    </p>
                )}
            </Card>
        </div>
    );
}