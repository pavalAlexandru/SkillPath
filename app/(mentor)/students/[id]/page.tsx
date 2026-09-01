import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/server/supabase/server';

export const dynamic = 'force-dynamic';

const NIVEL_STYLES: Record<string, string> = {
    JUNIOR: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    MIDDLE: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    SENIOR: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
};

const STATUS_LABEL: Record<string, string> = {
    COMPLETED: 'Finalizată',
    IN_PROGRESS: 'În desfășurare',
    EXPIRED: 'Expirată',
};

export default async function StudentDetailPage({
                                                    params,
                                                }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const [{ data: student, error: studentError }, { data: assessments }] = await Promise.all([
        supabase.from('profiles').select('*, student_profiles(current_level)').eq('id', id).single(),
        supabase.from('assessments').select('*').eq('user_id', id).order('started_at', { ascending: false }),
    ]);

    if (studentError || !student) {
        return (
            <Card className="border-rose-200 bg-rose-50/90 dark:border-rose-900/60 dark:bg-rose-950/40">
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                    Nu am putut încărca studentul: {studentError?.message ?? 'nu există'}
                </p>
            </Card>
        );
    }

    const idEvaluari = (assessments ?? []).map((a) => a.id);
    const { data: scoruriCategorii } = idEvaluari.length
        ? await supabase
            .from('assessment_category_scores')
            .select('category_id, score_percentage, is_weak_area, categories(name)')
            .in('assessment_id', idEvaluari)
        : { data: [] };

    const statisticiPerCategorie = new Map<
        string,
        { numeCategorie: string; sumaScoruri: number; numar: number; esteZonaSlaba: boolean }
    >();
    for (const s of scoruriCategorii ?? []) {
        const nume = s.categories?.name ?? 'Categorie necunoscută';
        const curent = statisticiPerCategorie.get(nume) ?? {
            numeCategorie: nume,
            sumaScoruri: 0,
            numar: 0,
            esteZonaSlaba: false,
        };
        curent.sumaScoruri += s.score_percentage ?? 0;
        curent.numar += 1;
        curent.esteZonaSlaba = curent.esteZonaSlaba || s.is_weak_area;
        statisticiPerCategorie.set(nume, curent);
    }

    const categoriiOrdonate = Array.from(statisticiPerCategorie.values()).sort(
        (a, b) => a.sumaScoruri / a.numar - b.sumaScoruri / b.numar,
    );

    const finalizate = (assessments ?? []).filter((a) => a.status === 'COMPLETED');
    const scorMediu = finalizate.length
        ? Math.round(finalizate.reduce((acc, a) => acc + (a.total_score ?? 0), 0) / finalizate.length)
        : null;

    return (
        <div className="w-full space-y-6">
            <div>
                <Link href="/students" className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400">
                    ← Înapoi la Studenți
                </Link>
                <div className="mt-2 flex items-center gap-3">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        {student.first_name} {student.last_name}
                    </h1>
                    {student.student_profiles?.current_level && (
                        <span
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${NIVEL_STYLES[student.student_profiles.current_level] ?? ''}`}
                        >
                            {student.student_profiles.current_level}
                        </span>
                    )}
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{student.email}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="border border-slate-200/80 bg-white/80 p-5 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Evaluări finalizate</p>
                    <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{finalizate.length}</p>
                </Card>
                <Card className="border border-slate-200/80 bg-white/80 p-5 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Scor mediu</p>
                    <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                        {scorMediu !== null ? `${scorMediu}%` : '—'}
                    </p>
                </Card>
                <Card className="border border-slate-200/80 bg-white/80 p-5 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total evaluări</p>
                    <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{assessments?.length ?? 0}</p>
                </Card>
            </div>

            <Card className="border border-slate-200/80 bg-white/80 p-6 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-white">Scor pe categorii</h2>
                {categoriiOrdonate.length > 0 ? (
                    <div className="space-y-3">
                        {categoriiOrdonate.map((c) => (
                            <div
                                key={c.numeCategorie}
                                className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/70 p-3.5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-800/40"
                            >
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{c.numeCategorie}</span>
                                <div className="flex items-center gap-3">
                                    {c.esteZonaSlaba && (
                                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300">
                                            Zonă slabă
                                        </span>
                                    )}
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {Math.round(c.sumaScoruri / c.numar)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="py-6 text-center text-sm font-medium text-slate-400 dark:text-slate-500">
                        Nu există încă scoruri pe categorii pentru acest student.
                    </p>
                )}
            </Card>

            <Card className="overflow-hidden border border-slate-200/80 bg-white/80 p-0 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Istoric evaluări</h2>
                </div>
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                    <tr>
                        <th className="px-6 py-3.5">Dată</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Scor</th>
                        <th className="px-6 py-3.5">Tip</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {assessments?.map((a) => (
                        <tr key={a.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                {new Date(a.started_at).toLocaleDateString('ro-RO')}
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{STATUS_LABEL[a.status] ?? a.status}</td>
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                {a.total_score !== null ? `${a.total_score}%` : '—'}
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                {a.is_surprise_mode ? 'Surprinde-mă' : 'Normal'}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {(!assessments || assessments.length === 0) && (
                    <p className="px-6 py-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                        Acest student nu a susținut încă nicio evaluare.
                    </p>
                )}
            </Card>
        </div>
    );
}