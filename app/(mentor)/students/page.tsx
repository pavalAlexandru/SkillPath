import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PromoteToMentorForm } from '@/components/mentor/PromoteToMentorForm';
import { toggleStudentActive } from '@/server/actions/students';
import { createClient } from '@/server/supabase/server';

export const dynamic = 'force-dynamic';

const NIVEL_STYLES: Record<string, string> = {
    JUNIOR: 'bg-emerald-50 text-emerald-700',
    MIDDLE: 'bg-amber-50 text-amber-700',
    SENIOR: 'bg-rose-50 text-rose-700',
};

const ORDINE_NIVEL: Record<string, number> = {
    JUNIOR: 1,
    MIDDLE: 2,
    SENIOR: 3,
};

export default async function StudentsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; level?: string; sort?: string }>;
}) {
    const params = await searchParams;
    const search = params.search ?? '';
    const level = params.level ?? '';
    const sort = params.sort ?? '';

    function sortLink(field: string) {
        const qs = new URLSearchParams();
        if (search) qs.set('search', search);
        if (level) qs.set('level', level);
        qs.set('sort', field);
        return `/students?${qs.toString()}`;
    }

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

    // Filtru pe nivel — se aplică după interogare, pentru că nivelul stă
    // în student_profiles, o tabelă legată, nu direct în profiles.
    const dupaNivel = level
        ? (students ?? []).filter((s) => s.student_profiles?.current_level === level)
        : (students ?? []);

    // Statistici per student: câte evaluări a terminat și scorul mediu.
    // O singură interogare pentru toți studenții, apoi le grupăm în cod —
    // mai simplu și mai rapid decât o interogare separată per student.
    const idStudenti = dupaNivel.map((s) => s.id);
    const { data: evaluariFinalizate } = idStudenti.length
        ? await supabase
              .from('assessments')
              .select('user_id, total_score')
              .eq('status', 'COMPLETED')
              .in('user_id', idStudenti)
        : { data: [] };

    const statisticiPerStudent = new Map<string, { numar: number; sumaScoruri: number }>();
    for (const a of evaluariFinalizate ?? []) {
        const curent = statisticiPerStudent.get(a.user_id) ?? { numar: 0, sumaScoruri: 0 };
        curent.numar += 1;
        curent.sumaScoruri += a.total_score ?? 0;
        statisticiPerStudent.set(a.user_id, curent);
    }

    const listaOrdonata = [...dupaNivel].sort((a, b) => {
        if (sort === 'level') {
            const nivelA = a.student_profiles?.current_level ?? '';
            const nivelB = b.student_profiles?.current_level ?? '';
            return (ORDINE_NIVEL[nivelA] ?? 0) - (ORDINE_NIVEL[nivelB] ?? 0);
        }
        if (sort === 'assessments') {
            const numarA = statisticiPerStudent.get(a.id)?.numar ?? 0;
            const numarB = statisticiPerStudent.get(b.id)?.numar ?? 0;
            return numarB - numarA;
        }
        return 0;
    });

    const areFiltre = search !== '' || level !== '';

    const studentiActivi = listaOrdonata.filter((s) => s.is_active).length;
    const scorMediuGeneral = (evaluariFinalizate ?? []).length
        ? Math.round(
              (evaluariFinalizate ?? []).reduce((acc, a) => acc + (a.total_score ?? 0), 0) /
                  (evaluariFinalizate ?? []).length,
          )
        : null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Studenți</h1>
                <p className="text-sm text-slate-500">
                    Gestionează conturile studenților și nivelul lor de acces.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                    <p className="text-sm font-medium text-slate-500">Total studenți</p>
                    <p className="mt-1 text-3xl font-bold text-slate-900">{listaOrdonata.length}</p>
                </Card>
                <Card>
                    <p className="text-sm font-medium text-slate-500">Studenți activi</p>
                    <p className="mt-1 text-3xl font-bold text-slate-900">{studentiActivi}</p>
                </Card>
                <Card>
                    <p className="text-sm font-medium text-slate-500">Scor mediu general</p>
                    <p className="mt-1 text-3xl font-bold text-slate-900">
                        {scorMediuGeneral !== null ? `${scorMediuGeneral}%` : '—'}
                    </p>
                </Card>
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

                    <div className="min-w-40">
                        <label className="block text-sm font-medium text-slate-700">Nivel</label>
                        <select
                            name="level"
                            defaultValue={level}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        >
                            <option value="">Toate</option>
                            <option value="JUNIOR">Junior</option>
                            <option value="MIDDLE">Middle</option>
                            <option value="SENIOR">Senior</option>
                        </select>
                    </div>

                    <Button type="submit" variant="secondary">Filtrează</Button>
                    {areFiltre && (
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
                            <th className="whitespace-nowrap px-6 py-3">
                                <a href={sortLink('level')} className="hover:text-slate-800">
                                    Nivel ↕
                                </a>
                            </th>
                            <th className="whitespace-nowrap px-6 py-3">
                                <a href={sortLink('assessments')} className="hover:text-slate-800">
                                    Evaluări ↕
                                </a>
                            </th>
                            <th className="px-6 py-3">Scor mediu</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {listaOrdonata.map((s) => {
                            const statistici = statisticiPerStudent.get(s.id);
                            const scorMediu = statistici && statistici.numar > 0
                                ? Math.round(statistici.sumaScoruri / statistici.numar)
                                : null;

                            return (
                                <tr key={s.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        <Link href={`/students/${s.id}`} className="hover:text-indigo-600 hover:underline">
                                            {s.first_name} {s.last_name}
                                        </Link>
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
                                    <td className="px-6 py-4">{statistici?.numar ?? 0}</td>
                                    <td className="px-6 py-4">
                                        {scorMediu !== null ? `${scorMediu}%` : '—'}
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
                                            <PromoteToMentorForm
                                                studentId={s.id}
                                                studentName={`${s.first_name} ${s.last_name}`}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {listaOrdonata.length === 0 && (
                    <p className="px-6 py-8 text-center text-sm text-slate-500">
                        {areFiltre ? 'Niciun student nu corespunde filtrelor.' : 'Nu există niciun student încă.'}
                    </p>
                )}
            </Card>
        </div>
    );
}
