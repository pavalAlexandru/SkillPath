import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/server/supabase/server';

export const dynamic = 'force-dynamic';

const NIVEL_STYLES: Record<string, string> = {
    JUNIOR: 'bg-emerald-50 text-emerald-700',
    MIDDLE: 'bg-amber-50 text-amber-700',
    SENIOR: 'bg-rose-50 text-rose-700',
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
            <Card className="border-rose-200 bg-rose-50">
                <p className="text-sm text-rose-700">
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

    // Grupăm scorurile pe categorie, ca să afișăm o singură dată pe categorie,
    // cu media scorurilor și dacă a fost vreodată marcată drept zonă slabă.
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
        <div className="space-y-6">
            <div>
                <Link href="/students" className="text-sm text-indigo-600 hover:underline">
                    ← Înapoi la Studenți
                </Link>
                <div className="mt-2 flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900">
                        {student.first_name} {student.last_name}
                    </h1>
                    {student.student_profiles?.current_level && (
                        <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${NIVEL_STYLES[student.student_profiles.current_level] ?? ''}`}
                        >
                            {student.student_profiles.current_level}
                        </span>
                    )}
                </div>
                <p className="text-sm text-slate-500">{student.email}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                    <p className="text-sm font-medium text-slate-500">Evaluări finalizate</p>
                    <p className="mt-1 text-3xl font-bold text-slate-900">{finalizate.length}</p>
                </Card>
                <Card>
                    <p className="text-sm font-medium text-slate-500">Scor mediu</p>
                    <p className="mt-1 text-3xl font-bold text-slate-900">
                        {scorMediu !== null ? `${scorMediu}%` : '—'}
                    </p>
                </Card>
                <Card>
                    <p className="text-sm font-medium text-slate-500">Total evaluări (inclusiv neterminate)</p>
                    <p className="mt-1 text-3xl font-bold text-slate-900">{assessments?.length ?? 0}</p>
                </Card>
            </div>

            <Card>
                <h2 className="mb-4 text-base font-bold text-slate-900">Scor pe categorii</h2>
                {categoriiOrdonate.length > 0 ? (
                    <div className="space-y-3">
                        {categoriiOrdonate.map((c) => (
                            <div
                                key={c.numeCategorie}
                                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
                            >
                                <span className="text-sm font-medium text-slate-800">{c.numeCategorie}</span>
                                <div className="flex items-center gap-2">
                                    {c.esteZonaSlaba && (
                                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                                            Zonă slabă
                                        </span>
                                    )}
                                    <span className="text-sm font-semibold text-slate-700">
                                        {Math.round(c.sumaScoruri / c.numar)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="py-4 text-center text-sm text-slate-400">
                        Nu există încă scoruri pe categorii pentru acest student.
                    </p>
                )}
            </Card>

            <Card className="overflow-hidden p-0">
                <div className="border-b border-slate-100 px-6 py-4">
                    <h2 className="text-base font-bold text-slate-900">Istoric evaluări</h2>
                </div>
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                        <tr>
                            <th className="px-6 py-3">Dată</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Scor</th>
                            <th className="px-6 py-3">Tip</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {assessments?.map((a) => (
                            <tr key={a.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    {new Date(a.started_at).toLocaleDateString('ro-RO')}
                                </td>
                                <td className="px-6 py-4">{STATUS_LABEL[a.status] ?? a.status}</td>
                                <td className="px-6 py-4">
                                    {a.total_score !== null ? `${a.total_score}%` : '—'}
                                </td>
                                <td className="px-6 py-4">
                                    {a.is_surprise_mode ? 'Surprinde-mă' : 'Normal'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {(!assessments || assessments.length === 0) && (
                    <p className="px-6 py-8 text-center text-sm text-slate-500">
                        Acest student nu a susținut încă nicio evaluare.
                    </p>
                )}
            </Card>
        </div>
    );
}
