import { Card } from '@/components/ui/Card';

export default function ProfilePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Profil & Statistici</h1>
                <p className="text-sm text-slate-500">Istoricul evaluărilor și progresul către următorul nivel.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card>
                    <p className="text-xs font-medium text-slate-500">Nivel Curent</p>
                    <p className="mt-2 text-2xl font-bold text-indigo-600">JUNIOR</p>
                </Card>
                <Card>
                    <p className="text-xs font-medium text-slate-500">Teste Finalizate</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">0</p>
                </Card>
                <Card>
                    <p className="text-xs font-medium text-slate-500">Scor Mediu</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-600">--%</p>
                </Card>
            </div>
        </div>
    );
}