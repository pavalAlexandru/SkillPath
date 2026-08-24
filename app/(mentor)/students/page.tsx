import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { promoteToMentor, toggleStudentActive } from '@/server/actions/students';
import { createClient } from '@/server/supabase/server';

export const dynamic = 'force-dynamic';

const NIVEL_STYLES: Record<string, string> = {
    JUNIOR: 'bg-emerald-50 text-emerald-700',
    MIDDLE: 'bg-amber-50 text-amber-700',
    SENIOR: 'bg-rose-50 text-rose-700',
};

export default async function StudentsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>;
}) {
    const params = await searchParams;
    const search = params.search ?? '';

    const supabase = await createClient();

    let query = supabase
        .from('profiles')
        .select('*, student_profiles(current_level)')
        .eq('role', 'STUDENT')
        .order('first_name');

    if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: students, error } = await query;

    if (error) {
        return (
            <Card className="border-rose-200 bg-rose-50">
                <p className="text-sm text-rose-700">
                    Nu am putut încărca studenții: {error.message}
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Studenți</h1>
                <p className="text-sm text-slate-500">
                    Gestionează conturile studenților și nivelul lor de acces.
                </p>
            </div>

            <Card className="bg-slate-50/60">
                <form className="flex flex-wrap items-end gap-3">
                    <div className="min-w-60 flex-1">
                        <label className="block text-sm font-medium text-slate-700">Caută</label>
                        <input
                            name="search"
                            defaultValue={search}
                            placeholder="Nume sau email..."
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <Button type="submit" variant="secondary">Caută</Button>
                    {search && (
                        <a href="/students" className="px-2 py-2 text-sm text-slate-500 hover:underline">
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
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Nivel</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {students?.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    {s.first_name} {s.last_name}
                                </td>
                                <td className="px-6 py-4">{s.email}</td>
                                <td className="px-6 py-4">
                                    {s.student_profiles?.current_level ? (
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${NIVEL_STYLES[s.student_profiles.current_level] ?? ''}`}
                                        >
                                            {s.student_profiles.current_level}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">—</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {s.is_active ? (
                                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                            Activ
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                                            Inactiv
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <form action={toggleStudentActive} className="inline">
                                            <input type="hidden" name="id" value={s.id} />
                                            <input type="hidden" name="is_active" value={String(s.is_active)} />
                                            <button
                                                type="submit"
                                                className={
                                                    s.is_active
                                                        ? 'text-slate-500 hover:text-slate-800 hover:underline'
                                                        : 'text-emerald-600 hover:underline'
                                                }
                                            >
                                                {s.is_active ? 'Dezactivează' : 'Activează'}
                                            </button>
                                        </form>
                                        <form action={promoteToMentor} className="inline">
                                            <input type="hidden" name="id" value={s.id} />
                                            <button type="submit" className="text-indigo-600 hover:underline">
                                                Promovează la mentor
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {students?.length === 0 && (
                    <p className="px-6 py-8 text-center text-sm text-slate-500">
                        {search ? 'Niciun student nu corespunde căutării.' : 'Nu există niciun student încă.'}
                    </p>
                )}
            </Card>
        </div>
    );
}
