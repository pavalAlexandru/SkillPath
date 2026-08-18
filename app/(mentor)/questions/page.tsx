import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function MentorQuestionsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Catalog Întrebări</h1>
                    <p className="text-sm text-slate-500">Gestionează întrebările oficiale din platformă.</p>
                </div>
                <Button variant="primary">
                    + Adaugă Întrebare Nouă
                </Button>
            </div>

            <Card className="overflow-hidden p-0">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                    <tr>
                        <th className="px-6 py-3">Enunț</th>
                        <th className="px-6 py-3">Categorie</th>
                        <th className="px-6 py-3">Dificultate</th>
                        <th className="px-6 py-3 text-right">Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">Ce este polimorfismul în Java?</td>
                        <td className="px-6 py-4">OOP Basics</td>
                        <td className="px-6 py-4">
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  Junior
                </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button className="text-indigo-600 hover:underline">Editează</button>
                        </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">Diferența dintre git merge și git rebase?</td>
                        <td className="px-6 py-4">Git</td>
                        <td className="px-6 py-4">
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  Mid
                </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button className="text-indigo-600 hover:underline">Editează</button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </Card>
        </div>
    );
}