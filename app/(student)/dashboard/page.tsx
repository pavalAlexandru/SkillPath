import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { getCurrentStudentLevel } from '@/server/supabase/profileService';
import { getCategoriesByLevel } from '@/server/supabase/categoryService';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const userLevel = await getCurrentStudentLevel();
    const categories = await getCategoriesByLevel(userLevel);

    const formatLevel = (level: string) => {
        switch (level) {
            case 'MIDDLE':
                return 'Nivel Middle';
            case 'SENIOR':
                return 'Nivel Senior';
            default:
                return 'Nivel Junior';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Panou Principal</h1>
                <p className="text-sm text-slate-500">
                    Urmărește-ți evoluția, statisticile de învățare și accesează rapid evaluările.
                </p>
            </div>

            {/* Carduri rapide de status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="p-5 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status Curent</span>
                    <p className="text-2xl font-bold text-indigo-600">{formatLevel(userLevel)}</p>
                    <p className="text-xs text-slate-500">Profil de student activ</p>
                </Card>

                <Card className="p-5 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Evaluări Active</span>
                    <p className="text-2xl font-bold text-slate-800">{categories.length} Categorii</p>
                    <p className="text-xs text-slate-500">Disponibile pentru nivelul tău</p>
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
                        Mergi în secțiunea dedicată de teste pentru a-ți valida competențele pe nivelul {userLevel}.
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