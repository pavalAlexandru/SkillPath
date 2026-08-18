import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Learning Path</h1>
                <p className="text-sm text-slate-500">Alege o categorie pentru a începe o evaluare sau încearcă un test mixt.</p>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-6">
                <h2 className="text-lg font-semibold text-indigo-950">Modul „Surprinde-mă”</h2>
                <p className="mt-1 text-sm text-indigo-800">
                    Generează un test rapid cu întrebări mixte din toate categoriile nivelului curent.
                </p>
                <Link
                    href="/assessment/new"
                    className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500 transition-colors"
                >
                    Începe Test Mixt
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {['OOP Basics', 'Git & Version Control', 'Databases / SQL'].map((category, idx) => (
                    <Card key={idx} className="p-5 space-y-3">
                        <h3 className="font-semibold text-slate-900">{category}</h3>
                        <p className="text-xs text-slate-500">Nivel Junior • 10 întrebări</p>
                        <Link
                            href={`/assessment/${idx + 1}`}
                            className="inline-block w-full text-center rounded-md border border-slate-300 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Start Evaluare
                        </Link>
                    </Card>
                ))}
            </div>
        </div>
    );
}