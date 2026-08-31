import Link from 'next/link';
import {Card} from '@/components/ui/Card'



import { createClient} from '@/server/supabase/server'




export default async function  MentorOverviewPage(){
    const supabase= await createClient()
    const [propuneri, intrebari, studenti, evaluari,zoneSlabe]= await Promise.all([
        supabase
            .from('questions')
            .select('*',{count:'exact', head:true})
            .eq('status', 'PENDING'),
        supabase
        .from('questions')
        .select('*',{count:'exact', head:true})
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

    ])
    const categoriiDificile = numaraCategoriiDificile(
        (zoneSlabe.data ?? []) as unknown as { category_id: number; categories: { name: string } | null }[],
    );
    //unknown înseamnă „ar putea fi orice, nu presupun nimic".

    // Ultimele 5 evaluări finalizate, cu numele studentului. Le luăm în două
    // interogări separate (evaluări, apoi profilurile lor) în loc de o singură
    // interogare cu legătură — mai simplu și fără riscul formei neașteptate
    // pe care l-am întâlnit la alte legături azi.
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

    // 1. Câți studenți activi sunt la fiecare nivel.
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

    // 2. Câte evaluări s-au finalizat în fiecare din ultimele 7 zile.
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

    // 3. Distribuția scorurilor pe trei categorii, pe toate evaluările finalizate.
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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Panou Mentor</h1>
                <p className="text-sm text-slate-500">
                    Privire de ansamblu asupra activității din platformă.
                </p>
            </div>

            <div className="flex flex-wrap gap-3">
                <Link
                    href="/questions"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Adaugă întrebare
                </Link>
                <Link
                    href="/categories"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Adaugă categorie
                </Link>
                <Link
                    href="/students"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                    <span className="material-symbols-outlined text-[18px]">groups</span>
                    Vezi studenți
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon="pending_actions"
                    barColor="border-t-amber-500"
                    chipColor="border-amber-200 bg-amber-50 text-amber-700"
                    chipLabel={propuneri.count && propuneri.count > 0 ? 'Necesită atenție' : 'La zi'}
                    label="Propuneri în așteptare"
                    value={propuneri.count ?? 0}
                    note="Vezi propunerile"
                    href="/proposals"
                />
                <StatCard
                    icon="quiz"
                    barColor="border-t-indigo-500"
                    chipColor="border-indigo-200 bg-indigo-50 text-indigo-700"
                    chipLabel="Catalog"
                    label="Întrebări active"
                    value={intrebari.count ?? 0}
                    note="Vezi banca de întrebări"
                    href="/questions"
                />
                <StatCard
                    icon="groups"
                    barColor="border-t-slate-400"
                    chipColor="border-slate-200 bg-slate-50 text-slate-600"
                    chipLabel="Comunitate"
                    label="Studenți activi"
                    value={studenti.count ?? 0}
                    note="Conturi cu rol student"
                />
                <StatCard
                    icon="task_alt"
                    barColor="border-t-emerald-500"
                    chipColor="border-emerald-200 bg-emerald-50 text-emerald-700"
                    chipLabel="Rapoarte"
                    label="Evaluări finalizate"
                    value={evaluari.count ?? 0}
                    note="Teste trimise de studenți"
                />
            </div>

            <Card>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900">Puncte critice studenți</h2>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        Atenție
                    </span>
                </div>
                <p className="mb-4 text-xs text-slate-500">
                    Categoriile la care studenții au fost marcați cel mai des ca zonă slabă:
                </p>

                {categoriiDificile.length > 0 ? (
                    <div className="space-y-3">
                        {categoriiDificile.map((cat) => (
                            <div
                                key={cat.name}
                                className="relative overflow-hidden rounded-lg border border-slate-100 bg-slate-50 p-3 pl-4"
                            >
                                <div className="absolute left-0 top-0 h-full w-1 bg-amber-500" />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-800">{cat.name}</span>
                                    <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-600">
                                        {cat.numar} {cat.numar === 1 ? 'apariție' : 'apariții'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="py-6 text-center text-sm text-slate-400">
                        Nu există încă suficiente evaluări pentru a identifica zone slabe.
                    </p>
                )}
            </Card>

            <Card className="overflow-hidden p-0">
                <div className="border-b border-slate-100 px-6 py-4">
                    <h2 className="text-base font-bold text-slate-900">Activitate recentă</h2>
                    <p className="text-xs text-slate-500">Ultimele evaluări finalizate de studenți.</p>
                </div>

                {evaluariRecente && evaluariRecente.length > 0 ? (
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-3">Student</th>
                                <th className="px-6 py-3">Dată</th>
                                <th className="px-6 py-3">Scor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {evaluariRecente.map((a) => (
                                <tr key={a.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {numePerId.get(a.user_id) ?? 'Student necunoscut'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {a.completed_at
                                            ? new Date(a.completed_at).toLocaleDateString('ro-RO')
                                            : '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {a.total_score !== null ? `${a.total_score}%` : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="px-6 py-8 text-center text-sm text-slate-500">
                        Nu există încă nicio evaluare finalizată.
                    </p>
                )}
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                    <h2 className="mb-4 text-base font-bold text-slate-900">Distribuție pe nivel</h2>
                    {totalStudentiNivel > 0 ? (
                        <div className="space-y-3">
                            <BaraStatistica eticheta="JUNIOR" valoare={numarPeNivel.JUNIOR} total={totalStudentiNivel} culoare="bg-emerald-500" />
                            <BaraStatistica eticheta="MIDDLE" valoare={numarPeNivel.MIDDLE} total={totalStudentiNivel} culoare="bg-amber-500" />
                            <BaraStatistica eticheta="SENIOR" valoare={numarPeNivel.SENIOR} total={totalStudentiNivel} culoare="bg-rose-500" />
                        </div>
                    ) : (
                        <p className="py-4 text-center text-sm text-slate-400">
                            Nu există încă studenți activi.
                        </p>
                    )}
                </Card>

                <Card>
                    <h2 className="mb-4 text-base font-bold text-slate-900">Distribuție scoruri</h2>
                    {totalScoruri > 0 ? (
                        <div className="space-y-3">
                            <BaraStatistica eticheta="Sub 50%" valoare={bucketScoruri.slab} total={totalScoruri} culoare="bg-rose-500" />
                            <BaraStatistica eticheta="50% – 75%" valoare={bucketScoruri.mediu} total={totalScoruri} culoare="bg-amber-500" />
                            <BaraStatistica eticheta="Peste 75%" valoare={bucketScoruri.bun} total={totalScoruri} culoare="bg-emerald-500" />
                        </div>
                    ) : (
                        <p className="py-4 text-center text-sm text-slate-400">
                            Nu există încă evaluări finalizate.
                        </p>
                    )}
                </Card>
            </div>

            <Card>
                <h2 className="mb-4 text-base font-bold text-slate-900">Activitate — ultimele 7 zile</h2>
                <div className="flex h-32 items-end justify-between gap-2">
                    {zileSaptamana.map((zi, i) => (
                        <div
                            key={i}
                            title={`${zi.numar} ${zi.numar === 1 ? 'evaluare' : 'evaluări'}`}
                            className="w-full rounded-t bg-indigo-500"
                            style={{ height: `${Math.max(4, (zi.numar / maxZi) * 100)}%` }}
                        />
                    ))}
                </div>
                <div className="mt-2 flex justify-between gap-2">
                    {zileSaptamana.map((zi, i) => (
                        <span key={i} className="flex-1 text-center text-[10px] uppercase text-slate-500">
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
            <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{props.eticheta}</span>
                <span className="text-slate-500">{props.valoare}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100">
                <div className={`h-2 rounded-full ${props.culoare}`} style={{ width: `${procent}%` }} />
            </div>
        </div>
    );
}



//op 3 categorii cele mai problematice,
function numaraCategoriiDificile(
    randuri: { category_id: number; categories: { name: string }| null }[],
)
{//functia primeste o lista de randuri
    const numarPerCategorie = new Map<string, number>();
//un "caieti" gol de numarare.cheia va fi numele categoriei (string) val nr de aparitii


    for (const rand of randuri) {
        const nume = rand.categories?.name ?? 'Categorie necunoscută';
        //scoatem nr categoriei din randu curent


        const numarVechi = numarPerCategorie.get(nume);

        // 2. dacă n-ai notat nimic încă, pornești de la zero
        const numarDeBaza = numarVechi ?? 0;

        // 3. adaugi apariția curentă
        const numarNou = numarDeBaza + 1;

        // 4. scrii înapoi în caiet, cu numărul actualizat
        numarPerCategorie.set(nume, numarNou);
    }

    return Array.from(numarPerCategorie.entries())
        .map(([name, numar]) => ({ name, numar }))
        .sort((a, b) => b.numar - a.numar)
        .slice(0, 3);
}
//entris scoate perechile nume valoare

// .map->iecare pereche (["Baze de date", 2]) devine un obiect mai ușor de folosit mai departe:
// { name: "Baze de date", numar: 2 }. [name, numar] desface direct perechea în două variabile,
// în loc să scrii perechea[0] și perechea[1].


//.sort descr
//Regula lui sort: dacă rezultatul e pozitiv, b vine înaintea lui a.
// b.numar - a.numar e pozitiv când b are mai multe apariții
// — deci cel cu mai multe apariții ajunge primul.

//slice pastreaza printele 3 din lista
function StatCard(props: {
    icon: string;
    barColor: string;
    chipColor: string;
    chipLabel: string;
    label: string;
    value: number;
    note: string;
    href?: string;
}) {
    return (
        <Card className={`border-t-4 ${props.barColor}`}>
            <div className="flex items-center justify-between">
                <span className={`material-symbols-outlined rounded-lg p-1.5 text-[20px] ${props.chipColor}`}>
                    {props.icon}
                </span>
                <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${props.chipColor}`}
                >
                    {props.chipLabel}
                </span>
            </div>

            <p className="mt-3 text-sm font-medium text-slate-500">{props.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{props.value}</p>

            {props.href ? (
                <Link
                    href={props.href}
                    className="mt-3 inline-block text-xs font-medium text-indigo-600 hover:underline"
                >
                    {props.note} →
                </Link>
            ) : (
                <p className="mt-3 text-xs text-slate-500">{props.note}</p>
            )}
        </Card>
    );
}