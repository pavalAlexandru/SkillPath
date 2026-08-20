import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export default async function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Panou Principal</h1>
                <p className="text-sm text-slate-500">
                    Urmărește-ți evoluția, statisticile de învățare și accesează rapid evaluările.
                </p>
            </div>

            {/* Carduri rapide de acțiune & statistici */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="p-5 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status Curent</span>
                    <p className="text-2xl font-bold text-indigo-600">Nivel Junior</p>
                    <p className="text-xs text-slate-500">Evaluare de bază validată</p>
                </Card>

                <Card className="p-5 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Evaluări Active</span>
                    <p className="text-2xl font-bold text-slate-800">4 Categorii</p>
                    <p className="text-xs text-slate-500">Disponibile pentru testare</p>
                </Card>

                <Card className="p-5 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Progres General</span>
                    <p className="text-2xl font-bold text-emerald-600">Activ</p>
                    <p className="text-xs text-slate-500">Plan adaptiv în desfășurare</p>
                </Card>
            </div>

            {/* Banner de redirecționare rapidă către teste */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Pregătit pentru o nouă evaluare?</h2>
                    <p className="text-sm text-slate-600 mt-0.5">
                        Mergi în secțiunea dedicată de teste pentru a-ți valida competențele pe tehnologii specifice.
                    </p>
                </div>
                <Link
                    href="/assessment"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500 transition-colors whitespace-nowrap"
                >
                    Mergi la Teste
                </Link>
            </div>
        </div>
    );
}