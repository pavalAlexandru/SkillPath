import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/server/supabase/server';

export default async function MentorOverviewPage() {
    const supabase = await createClient();
    const [propuneri, intrebari, studenti, evaluari, zoneSlabe] = await Promise.all([
        supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'PENDING'),
        supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'APPROVED')
            .eq('is_active', true),
        supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'STUDENT')
            .eq('is_active', true),
        supabase
            .from('assessments')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'COMPLETED'),
        supabase
            .from('assessment_category_scores')
            .select('category_id, categories(name)')
            .eq('is_weak_area', true),
    ]);

    const categoriiDificile = numaraCategoriiDificile(
        (zoneSlabe.data ?? []) as unknown as { category_id: number; categories: { name: string } | null }[],
    );

    const { data: evaluariRecente } = await supabase
        .from('assessments')
        .select('id, user_id, total_score, completed_at')
        .eq('status', 'COMPLETED')
        .order('completed_at', { ascending: false })
        .limit(5);

    const idStudentiRecenti = (evaluariRecente ?? []).map((a) => a.user_id);
    const { data: profileRecente } = idStudentiRecenti.length
        ? await supabase.from('profiles').select('id, first_name, last_name').in('id', idStudentiRecenti)
        : { data: [] };

    const numePerId = new Map(
        (profileRecente ?? []).map((p) => [p.id, `${p.first_name} ${p.last_name}`]),
    );

    const { data: studentiPeNivel } = await supabase
        .from('profiles')
        .select('id, student_profiles(current_level)')
        .eq('role', 'STUDENT')
        .eq('is_active', true);

    const numarPeNivel: Record<string, number> = { JUNIOR: 0, MIDDLE: 0, SENIOR: 0 };
    for (const s of studentiPeNivel ?? []) {
        const nivel = (s.student_profiles as unknown as { current_level: string } | null)?.current_level;
        if (nivel && nivel in numarPeNivel) {
            numarPeNivel[nivel] += 1;
        }
    }
    const totalStudentiNivel = numarPeNivel.JUNIOR + numarPeNivel.MIDDLE + numarPeNivel.SENIOR;

    const azi = new Date();
    const sapteZileInUrma = new Date(azi);
    sapteZileInUrma.setDate(sapteZileInUrma.getDate() - 6);
    sapteZileInUrma.setHours(0, 0, 0, 0);

    const { data: evaluariSaptamana } = await supabase
        .from('assessments')
        .select('completed_at')
        .eq('status', 'COMPLETED')
        .gte('completed_at', sapteZileInUrma.toISOString());

    const zileSaptamana: { eticheta: string; numar: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const zi = new Date(azi);
        zi.setDate(zi.getDate() - i);
        const cheieZi = zi.toISOString().slice(0, 10);
        const numar = (evaluariSaptamana ?? []).filter(
            (a) => a.completed_at?.slice(0, 10) === cheieZi,
        ).length;
        zileSaptamana.push({ eticheta: zi.toLocaleDateString('ro-RO', { weekday: 'short' }), numar });
    }
    const maxZi = Math.max(1, ...zileSaptamana.map((z) => z.numar));

    const { data: toateScorurile } = await supabase
        .from('assessments')
        .select('total_score')
        .eq('status', 'COMPLETED');

    const bucketScoruri = { slab: 0, mediu: 0, bun: 0 };
    for (const a of toateScorurile ?? []) {
        const scor = a.total_score ?? 0;
        if (scor < 50) bucketScoruri.slab += 1;
        else if (scor < 75) bucketScoruri.mediu += 1;
        else bucketScoruri.bun += 1;
    }
    const totalScoruri = bucketScoruri.slab + bucketScoruri.mediu + bucketScoruri.bun;

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Panou Mentor</h1>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Privire de ansamblu asupra activității din platformă.
                </p>
            </div>

            {/* Butoane Acțiuni Rapide */}
            <div className="flex flex-wrap gap-3">
                <Link
                    href="/questions"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/80 px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs backdrop-blur-md transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                >
                    <PlusIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Adaugă întrebare
                </Link>
                <Link
                    href="/categories"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/80 px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs backdrop-blur-md transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                >
                    <FolderPlusIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Adaugă categorie
                </Link>
                <Link
                    href="/students"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/80 px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs backdrop-blur-md transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                >
                    <UsersIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Vezi studenți
                </Link>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={<ClockIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                    iconBg="bg-amber-500/10 dark:bg-amber-500/15"
                    chipColor="border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300"
                    chipLabel={propuneri.count && propuneri.count > 0 ? 'Necesită atenție' : 'La zi'}
                    label="Propuneri în așteptare"
                    value={propuneri.count ?? 0}
                    note="Vezi propunerile"
                    href="/proposals"
                />
                <StatCard
                    icon={<LayersIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
                    iconBg="bg-indigo-500/10 dark:bg-indigo-500/15"
                    chipColor="border-indigo-200/80 bg-indigo-50 text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-300"
                    chipLabel="Catalog"
                    label="Întrebări active"
                    value={intrebari.count ?? 0}
                    note="Vezi banca de întrebări"
                    href="/questions"
                />
                <StatCard
                    icon={<UsersIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />}
                    iconBg="bg-sky-500/10 dark:bg-sky-500/15"
                    chipColor="border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-300"
                    chipLabel="Comunitate"
                    label="Studenți activi"
                    value={studenti.count ?? 0}
                    note="Conturi cu rol student"
                />
                <StatCard
                    icon={<CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                    iconBg="bg-emerald-500/10 dark:bg-emerald-500/15"
                    chipColor="border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                    chipLabel="Rapoarte"
                    label="Evaluări finalizate"
                    value={evaluari.count ?? 0}
                    note="Teste trimise de studenți"
                />
            </div>

            {/* Puncte critice studenți */}
            <Card className="border border-slate-200/80 bg-white/80 p-6 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Puncte critice studenți</h2>
                    <span className="rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300">
                        Atenție
                    </span>
                </div>
                <p className="mb-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Categoriile la care studenții au fost marcați cel mai des ca zonă slabă:
                </p>

                {categoriiDificile.length > 0 ? (
                    <div className="space-y-3">
                        {categoriiDificile.map((cat) => (
                            <div
                                key={cat.name}
                                className="relative flex items-center justify-between overflow-hidden rounded-xl border border-slate-200/70 bg-slate-50/60 p-3.5 pl-4 backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-800/40"
                            >
                                <div className="absolute left-0 top-0 h-full w-1 bg-amber-500" />
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{cat.name}</span>
                                <span className="rounded-lg bg-amber-100/80 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                    {cat.numar} {cat.numar === 1 ? 'apariție' : 'apariții'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="py-6 text-center text-sm font-medium text-slate-400 dark:text-slate-500">
                        Nu există încă suficiente evaluări pentru a identifica zone slabe.
                    </p>
                )}
            </Card>

            {/* Activitate recentă */}
            <Card className="overflow-hidden border border-slate-200/80 bg-white/80 p-0 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Activitate recentă</h2>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Ultimele evaluări finalizate de studenți.</p>
                </div>

                {evaluariRecente && evaluariRecente.length > 0 ? (
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                        <thead className="border-b border-slate-200/80 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
                        <tr>
                            <th className="px-6 py-3.5">Student</th>
                            <th className="px-6 py-3.5">Dată</th>
                            <th className="px-6 py-3.5">Scor</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {evaluariRecente.map((a) => (
                            <tr key={a.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                    {numePerId.get(a.user_id) ?? 'Student necunoscut'}
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                    {a.completed_at
                                        ? new Date(a.completed_at).toLocaleDateString('ro-RO')
                                        : '—'}
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                    {a.total_score !== null ? `${a.total_score}%` : '—'}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="px-6 py-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                        Nu există încă nicio evaluare finalizată.
                    </p>
                )}
            </Card>

            {/* Statistici: Nivel & Scoruri */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="border border-slate-200/80 bg-white/80 p-6 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                    <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-white">Distribuție pe nivel</h2>
                    {totalStudentiNivel > 0 ? (
                        <div className="space-y-4">
                            <BaraStatistica eticheta="JUNIOR" valoare={numarPeNivel.JUNIOR} total={totalStudentiNivel} culoare="bg-emerald-500" />
                            <BaraStatistica eticheta="MIDDLE" valoare={numarPeNivel.MIDDLE} total={totalStudentiNivel} culoare="bg-amber-500" />
                            <BaraStatistica eticheta="SENIOR" valoare={numarPeNivel.SENIOR} total={totalStudentiNivel} culoare="bg-rose-500" />
                        </div>
                    ) : (
                        <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">
                            Nu există încă studenți activi.
                        </p>
                    )}
                </Card>

                <Card className="border border-slate-200/80 bg-white/80 p-6 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                    <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-white">Distribuție scoruri</h2>
                    {totalScoruri > 0 ? (
                        <div className="space-y-4">
                            <BaraStatistica eticheta="Sub 50%" valoare={bucketScoruri.slab} total={totalScoruri} culoare="bg-rose-500" />
                            <BaraStatistica eticheta="50% – 75%" valoare={bucketScoruri.mediu} total={totalScoruri} culoare="bg-amber-500" />
                            <BaraStatistica eticheta="Peste 75%" valoare={bucketScoruri.bun} total={totalScoruri} culoare="bg-emerald-500" />
                        </div>
                    ) : (
                        <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">
                            Nu există încă evaluări finalizate.
                        </p>
                    )}
                </Card>
            </div>

            {/* Grafic Activitate */}
            <Card className="border border-slate-200/80 bg-white/80 p-6 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-white">Activitate — ultimele 7 zile</h2>
                <div className="flex h-32 items-end justify-between gap-2 pt-4">
                    {zileSaptamana.map((zi, i) => (
                        <div
                            key={i}
                            title={`${zi.numar} ${zi.numar === 1 ? 'evaluare' : 'evaluări'}`}
                            className="w-full rounded-t-lg bg-indigo-600/80 transition-all hover:bg-indigo-500 dark:bg-indigo-500/80 dark:hover:bg-indigo-400"
                            style={{ height: `${Math.max(8, (zi.numar / maxZi) * 100)}%` }}
                        />
                    ))}
                </div>
                <div className="mt-3 flex justify-between gap-2">
                    {zileSaptamana.map((zi, i) => (
                        <span key={i} className="flex-1 text-center text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                            {zi.eticheta}
                        </span>
                    ))}
                </div>
            </Card>
        </div>
    );
}

function BaraStatistica(props: { eticheta: string; valoare: number; total: number; culoare: string }) {
    const procent = props.total > 0 ? (props.valoare / props.total) * 100 : 0;
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">{props.eticheta}</span>
                <span className="text-slate-500 dark:text-slate-400">{props.valoare}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className={`h-2 rounded-full ${props.culoare}`} style={{ width: `${procent}%` }} />
            </div>
        </div>
    );
}

function numaraCategoriiDificile(
    randuri: { category_id: number; categories: { name: string } | null }[],
) {
    const numarPerCategorie = new Map<string, number>();

    for (const rand of randuri) {
        const nume = rand.categories?.name ?? 'Categorie necunoscută';
        const numarVechi = numarPerCategorie.get(nume);
        const numarDeBaza = numarVechi ?? 0;
        const numarNou = numarDeBaza + 1;
        numarPerCategorie.set(nume, numarNou);
    }

    return Array.from(numarPerCategorie.entries())
        .map(([name, numar]) => ({ name, numar }))
        .sort((a, b) => b.numar - a.numar)
        .slice(0, 3);
}

function StatCard(props: {
    icon: React.ReactNode;
    iconBg: string;
    chipColor: string;
    chipLabel: string;
    label: string;
    value: number;
    note: string;
    href?: string;
}) {
    return (
        <Card className="border border-slate-200/80 bg-white/80 p-5 backdrop-blur-md shadow-xs transition-all hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/80 dark:hover:border-slate-700">
            <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${props.iconBg}`}>
                    {props.icon}
                </div>
                <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${props.chipColor}`}
                >
                    {props.chipLabel}
                </span>
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">{props.label}</p>
            <p className="mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{props.value}</p>

            {props.href ? (
                <Link
                    href={props.href}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    {props.note} →
                </Link>
            ) : (
                <p className="mt-3 text-xs font-medium text-slate-400 dark:text-slate-500">{props.note}</p>
            )}
        </Card>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

function FolderPlusIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            <line x1="12" y1="10" x2="12" y2="16" />
            <line x1="9" y1="13" x2="15" y2="13" />
        </svg>
    );
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function ClockIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function LayersIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
        </svg>
    );
}

function CheckCircleIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}