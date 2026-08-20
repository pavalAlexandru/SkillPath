import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { getJuniorCategories } from '@/server/supabase/assessmentService';

export default async function DashboardPage() {
    const categories = await getJuniorCategories();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Learning Path</h1>
                <p className="text-sm text-slate-500">
                    Alege o categorie pentru a începe o evaluare sau încearcă un test mixt.
                </p>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-6">
                <h2 className="text-lg font-semibold text-indigo-950">Modul „Surprinde-mă”</h2>
                <p className="mt-1 text-sm text-indigo-800">
                    Generează un test rapid cu 10 întrebări alese aleatoriu din toate categoriile de nivel Junior.
                </p>
                <Link
                    href="/assessment/surprise"
                    className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500 transition-colors"
                >
                    Începe Test Mixt
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => (
                    <Card key={cat.id} className="p-5 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                            <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2">{cat.description}</p>
                        </div>

                        <div className="space-y-2">
              <span className="inline-block rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                Nivel {cat.level} • 10 Întrebări Random
              </span>
                            <Link
                                href={`/assessment/${cat.id}`}
                                className="inline-block w-full text-center rounded-md border border-slate-300 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Start Evaluare
                            </Link>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}