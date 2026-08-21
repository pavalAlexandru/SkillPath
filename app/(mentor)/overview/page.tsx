import Link from 'next/link';
import {Card} from '@/components/ui/Card'



import { createClient} from '@/server/supabase/server'




export default async function  MentorOverviewPage(){
    const supabase= await createClient()
    const [propuneri, intrebari, studenti, evaluari,zoneSlabe]= await Promise.all([
        supabase
            .from('questions')
            .select('*',{count:' exact', head:true})
            .eq('status', 'PENDING'),
        supabase
        .from('questions')
        .select('*',{count:' exact', head:true})
        .eq('status', 'PENDING')
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
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Panou Mentor</h1>
                <p className="text-sm text-slate-500">
                    Privire de ansamblu asupra activității din platformă.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    barColor="border-t-amber-500"
                    chipColor="border-amber-200 bg-amber-50 text-amber-700"
                    chipLabel={propuneri.count && propuneri.count > 0 ? 'Necesită atenție' : 'La zi'}
                    label="Propuneri în așteptare"
                    value={propuneri.count ?? 0}
                    note="Vezi propunerile"
                    href="/proposals"
                />
                <StatCard
                    barColor="border-t-indigo-500"
                    chipColor="border-indigo-200 bg-indigo-50 text-indigo-700"
                    chipLabel="Catalog"
                    label="Întrebări active"
                    value={intrebari.count ?? 0}
                    note="Vezi banca de întrebări"
                    href="/questions"
                />
                <StatCard
                    barColor="border-t-slate-400"
                    chipColor="border-slate-200 bg-slate-50 text-slate-600"
                    chipLabel="Comunitate"
                    label="Studenți activi"
                    value={studenti.count ?? 0}
                    note="Conturi cu rol student"
                />
                <StatCard
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
            <span
                className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${props.chipColor}`}
            >
                {props.chipLabel}
            </span>

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