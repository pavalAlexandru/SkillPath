import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createCategory } from '@/server/actions/categories';
import { supabase } from '@/server/supabase';

export default async function CategoriesPage() {
    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) {
        return (
            <Card className="border-rose-200 bg-rose-50">
                <p className="text-sm text-rose-700">
                    Nu am putut încărca categoriile: {error.message}
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Catalog Categorii</h1>
                <p className="text-sm text-slate-500">
                    Gestionează domeniile pe care se dau evaluările.
                </p>
            </div>

            <Card>
                <form action={createCategory} className="flex flex-wrap items-end gap-3">
                    <div className="min-w-50 flex-1">
                        <label className="block text-sm font-medium text-slate-700">Nume</label>
                        <input
                            name="name"
                            required
                            minLength={2}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="min-w-60 flex-2">
                        <label className="block text-sm font-medium text-slate-700">Descriere</label>
                        <input
                            name="description"
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                    </div>

                    <Button type="submit">Adaugă</Button>
                </form>
            </Card>

            <Card className="overflow-hidden p-0">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                    <tr>
                        <th className="px-6 py-3">Nume</th>
                        <th className="px-6 py-3">Descriere</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {categories?.map((category) => (
                        <tr key={category.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900">
                                {category.name}
                            </td>
                            <td className="px-6 py-4">{category.description ?? '—'}</td>
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
                                <button className="text-indigo-600 hover:underline">
                                    Editează
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {categories?.length === 0 && (
                    <p className="px-6 py-8 text-center text-sm text-slate-500">
                        Nu există nicio categorie încă.
                    </p>
                )}
            </Card>
        </div>
    );
}