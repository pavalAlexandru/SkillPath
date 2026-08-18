import { Card } from '@/components/ui/Card';

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Utilizatori & Roluri</h1>
                    <p className="text-sm text-slate-500">Gestionează conturile și permisiunile de acces din platformă.</p>
                </div>
            </div>

            <Card className="overflow-hidden p-0">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                    <tr>
                        <th className="px-6 py-3">Utilizator</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Rol</th>
                        <th className="px-6 py-3 text-right">Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">Alex Popescu</td>
                        <td className="px-6 py-4 text-slate-500">alex.popescu@skillpath.ro</td>
                        <td className="px-6 py-4">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  STUDENT
                </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button className="text-indigo-600 hover:underline">Schimbă Rol</button>
                        </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">Prof. Maria Ionescu</td>
                        <td className="px-6 py-4 text-slate-500">m.ionescu@skillpath.ro</td>
                        <td className="px-6 py-4">
                <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                  MENTOR
                </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button className="text-indigo-600 hover:underline">Schimbă Rol</button>
                        </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">Admin Central</td>
                        <td className="px-6 py-4 text-slate-500">admin@skillpath.ro</td>
                        <td className="px-6 py-4">
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                  ADMIN
                </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button className="text-indigo-600 hover:underline">Schimbă Rol</button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </Card>
        </div>
    );
}