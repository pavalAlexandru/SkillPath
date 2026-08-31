import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createCategory ,updateCategory, toggleCategoryActive} from '@/server/actions/categories';
import { supabase } from '@/server/supabase';


const LEVEL_STYLES: Record<string, string> = {
    JUNIOR: 'bg-emerald-50 text-emerald-700',   // verde
    MIDDLE: 'bg-amber-50 text-amber-700',       // galben
    SENIOR: 'bg-rose-50 text-rose-700',         // roșu
}

const ORDINE_NIVEL: Record<string, number> = {
    JUNIOR: 1,
    MIDDLE: 2,
    SENIOR: 3,
};


export default async function CategoriesPage({
                                                 searchParams,
                                             }: {
    searchParams: Promise<{ search?: string; status?: string ,edit?:string; sort?: string; level?: string}>;
}) {
    const params = await searchParams;
    const search = params.search ?? '';
    const status = params.status ?? 'all';
    const sort = params.sort ?? '';
    const level = params.level ?? '';
    const editId=params.edit ?Number(params.edit ) : null; //transforma string in nr

    function sortLink(field: string) {
        const qs = new URLSearchParams();
        if (search) qs.set('search', search);
        if (status !== 'all') qs.set('status', status);
        if (level) qs.set('level', level);
        qs.set('sort', field);
        return `/categories?${qs.toString()}`;
    }



    const{ data: editing} =editId
        ? await supabase.from('categories').select('*').eq('id',editId).single()
        :{data: null}

    //Dacă editId are un număr → cere din DB acea categorie (.single() = „vreau un singur rând, nu o listă”).
    // Dacă editId e null → nu întreabă DB-ul deloc, pune direct editing = null.




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
            <Card className="border-rose-200 bg-rose-50">
                <p className="text-sm text-rose-700">
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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Catalog Categorii</h1>
                <p className="text-sm text-slate-500">
                    Gestionează domeniile pe care se dau evaluările.
                </p>
            </div>


            <Card>
                <form
                    key={editing?.id ?? 'new'}
                    action={editing ? updateCategory : createCategory}
                    className="flex flex-wrap items-end gap-3"
                >
                    {editing && <input type="hidden" name="id" value={editing.id} />}

                    <div className="min-w-50 flex-1">
                        <label className="block text-sm font-medium text-slate-700">Nume</label>
                        <input
                            name="name"
                            required
                            minLength={2}
                            defaultValue={editing?.name ?? ''}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="min-w-60 flex-2">
                        <label className="block text-sm font-medium text-slate-700">Descriere</label>
                        <input
                            name="description"
                            defaultValue={editing?.description ?? ''}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="min-w-40">
                        <label className="block text-sm font-medium text-slate-700">Nivel</label>
                        <select name="level" defaultValue={editing?.level ?? 'JUNIOR'}
                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                            <option value="JUNIOR">Junior</option>
                            <option value="MIDDLE">Middle</option>
                            <option value="SENIOR">Senior</option>
                        </select>
                    </div>
                    <Button type="submit">{editing ? 'Salvează' : 'Adaugă'}</Button>

                    {editing && (
                        <a
                            href="/categories"
                            className="px-2 py-2 text-sm text-slate-500 hover:text-slate-800 hover:underline"
                        >
                            Anulează
                        </a>
                    )}
                </form>
            </Card>





            <Card className="bg-slate-50/60">
                <form className="flex flex-wrap items-end gap-3">
                    <div className="min-w-50 flex-1">
                        <label className="block text-sm font-medium text-slate-700">Caută</label>
                        <input
                            name="search"
                            defaultValue={search}
                            placeholder="Nume categorie..."
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="min-w-40">
                        <label className="block text-sm font-medium text-slate-700">Status</label>
                        <select
                            name="status"
                            defaultValue={status}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="all">Toate</option>
                            <option value="active">Doar active</option>
                            <option value="inactive">Doar inactive</option>
                        </select>
                    </div>

                    <div className="min-w-40">
                        <label className="block text-sm font-medium text-slate-700">Nivel</label>
                        <select
                            name="level"
                            defaultValue={level}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">Toate</option>
                            <option value="JUNIOR">Junior</option>
                            <option value="MIDDLE">Middle</option>
                            <option value="SENIOR">Senior</option>
                        </select>
                    </div>

                    <Button type="submit" variant="secondary">Filtrează</Button>

                    {areFiltre && (
                        <a
                            href="/categories"
                            className="px-2 py-2 text-sm text-slate-500 hover:text-slate-800 hover:underline"
                        >
                            Resetează
                        </a>
                    )}
                </form>
            </Card>

            <Card className="overflow-hidden p-0">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                    <tr>
                        <th className="px-6 py-3">Nume</th>
                        <th className="px-6 py-3">Descriere</th>
                        <th className="whitespace-nowrap px-6 py-3">
                            <a href={sortLink('level')} className="hover:text-slate-800">
                                Level ↕
                            </a>
                        </th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {listaOrdonata.map((category) => (
                        <tr key={category.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900">
                                {category.name}
                            </td>
                            <td className="px-6 py-4">{category.description ?? '—'}</td>
                            <td className="px-6 py-4">                                  {/* ← nou */}
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${LEVEL_STYLES[category.level] ?? ''}`}>
        {category.level}
    </span>
                            </td>
                            <td className="px-6 py-4">
                                {category.is_active ? (
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
                                    <a href={`/categories?edit=${category.id}`} className="text-indigo-600 hover:underline">
                                        Editează
                                    </a>
                                    <form action={toggleCategoryActive} className="inline">
                                        <input type="hidden" name="id" value={category.id} />
                                        <input type="hidden" name="is_active" value={String(category.is_active)} />
                                        <button
                                            type="submit"
                                            className={
                                                category.is_active
                                                    ? 'text-slate-500 hover:text-slate-800 hover:underline'
                                                    : 'text-emerald-600 hover:underline'
                                            }
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
                    <p className="px-6 py-8 text-center text-sm text-slate-500">
                        {areFiltre
                            ? 'Nicio categorie nu corespunde filtrelor.'
                            : 'Nu există nicio categorie încă.'}
                    </p>
                )}
            </Card>
        </div>
    );
}