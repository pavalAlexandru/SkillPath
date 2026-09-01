import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PromoteToMentorForm } from '@/components/mentor/PromoteToMentorForm';
import { toggleStudentActive } from '@/server/actions/students';
import { createClient } from '@/server/supabase/server';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

const NIVEL_STYLES: Record<string, string> = {
    JUNIOR: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    MIDDLE: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    SENIOR: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
};

const ORDINE_NIVEL: Record<string, number> = {
    JUNIOR: 1,
    MIDDLE: 2,
    SENIOR: 3,
};

export default async function StudentsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; level?: string; sort?: string; page?: string }>;
}) {
    const params = await searchParams;
    const search = params.search ?? '';
    const level = params.level ?? '';
    const sort = params.sort ?? '';
    const currentPage = Math.max(1, Number(params.page ?? '1') || 1);

    function buildUrl(newPage: number, newSort?: string) {
        const qs = new URLSearchParams();
        if (search) qs.set('search', search);
        if (level) qs.set('level', level);
        if (newSort !== undefined ? newSort : sort) {
            qs.set('sort', newSort !== undefined ? newSort : sort);
        }
        if (newPage > 1) qs.set('page', String(newPage));
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
            <Card className="border-rose-200 bg-rose-50/90 dark:border-rose-900/60 dark:bg-rose-950/40">
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                    Nu am putut încărca studenții: {error.message}
                </p>
            </Card>
        );
    }

    const dupaNivel = level
        ? (students ?? []).filter((s) => s.student_profiles?.current_level === level)
        : (students ?? []);

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

    const listaSortata = [...dupaNivel].sort((a, b) => {
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

    const totalCount = listaSortata.length;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
    const fromIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedStudents = listaSortata.slice(fromIndex, fromIndex + PAGE_SIZE);

    const areFiltre = search !== '' || level !== '';
    const studentiActivi = listaSortata.filter((s) => s.is_active).length;
    const scorMediuGeneral = (evaluariFinalizate ?? []).length
        ? Math.round(
            (evaluariFinalizate ?? []).reduce((acc, a) => acc + (a.total_score ?? 0), 0) /
            (evaluariFinalizate ?? []).length,
        )
        : null;

    return (
        <div className="w-full space-y-6">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Studenți</h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Gestionează conturile studenților și nivelul lor de acces.
                </p>
            </div>

            {/* 3 Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="border border-slate-200/80 bg-white/80 p-5 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total studenți</p>
                    <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{totalCount}</p>
                </Card>
                <Card className="border border-slate-200/80 bg-white/80 p-5 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Studenți activi</p>
                    <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{studentiActivi}</p>
                </Card>
                <Card className="border border-slate-200/80 bg-white/80 p-5 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Scor mediu general</p>
                    <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                        {scorMediuGeneral !== null ? `${scorMediuGeneral}%` : '—'}
                    </p>
                </Card>
            </div>

            {/* Filtre */}
            <Card className="border border-slate-200/80 bg-slate-50/70 p-5 backdrop-blur-md shadow-2xs dark:border-slate-800/80 dark:bg-slate-900/60">
                <form className="flex flex-wrap items-end gap-4">
                    <div className="min-w-60 flex-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Caută</label>
                        <input
                            name="search"
                            defaultValue={search}
                            placeholder="Nume sau email..."
                            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500"
                        />
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
                        <Link href="/students" scroll={false} className="px-2 py-2 text-sm font-semibold text-slate-500 hover:underline dark:text-slate-400">
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
                        <th className="px-6 py-3.5">Nume</th>
                        <th className="px-6 py-3.5">Email</th>
                        <th className="whitespace-nowrap px-6 py-3.5">
                            <Link href={buildUrl(1, 'level')} scroll={false} className="hover:text-slate-900 dark:hover:text-white">
                                Nivel ↕
                            </Link>
                        </th>
                        <th className="whitespace-nowrap px-6 py-3.5">
                            <Link href={buildUrl(1, 'assessments')} scroll={false} className="hover:text-slate-900 dark:hover:text-white">
                                Evaluări ↕
                            </Link>
                        </th>
                        <th className="px-6 py-3.5">Scor mediu</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedStudents.map((s) => {
                        const statistici = statisticiPerStudent.get(s.id);
                        const scorMediu = statistici && statistici.numar > 0
                            ? Math.round(statistici.sumaScoruri / statistici.numar)
                            : null;

                        return (
                            <tr key={s.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                    <Link href={`/students/${s.id}`} scroll={false} className="hover:text-indigo-600 hover:underline dark:hover:text-indigo-400">
                                        {s.first_name} {s.last_name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{s.email}</td>
                                <td className="px-6 py-4">
                                    {s.student_profiles?.current_level ? (
                                        <span
                                            className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${NIVEL_STYLES[s.student_profiles.current_level] ?? ''}`}
                                        >
                                            {s.student_profiles.current_level}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 dark:text-slate-500">—</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{statistici?.numar ?? 0}</td>
                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                    {scorMediu !== null ? `${scorMediu}%` : '—'}
                                </td>
                                <td className="px-6 py-4">
                                    {s.is_active ? (
                                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300">
                                            Activ
                                        </span>
                                    ) : (
                                        <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
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
                                                className={`cursor-pointer font-semibold transition hover:underline ${
                                                    s.is_active
                                                        ? 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                                        : 'text-emerald-600 dark:text-emerald-400'
                                                }`}
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

                {totalCount === 0 && (
                    <p className="px-6 py-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                        {areFiltre ? 'Niciun student nu corespunde filtrelor.' : 'Nu există niciun student încă.'}
                    </p>
                )}

                {/* Bară de Paginare */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/40">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Afișez <span className="font-bold text-slate-900 dark:text-white">{fromIndex + 1}</span> -{' '}
                            <span className="font-bold text-slate-900 dark:text-white">
                                {Math.min(fromIndex + PAGE_SIZE, totalCount)}
                            </span> din <span className="font-bold text-slate-900 dark:text-white">{totalCount}</span> studenți
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