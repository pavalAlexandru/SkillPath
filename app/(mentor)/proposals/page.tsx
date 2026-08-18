import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function MentorProposalsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Propuneri Întrebări</h1>
                <p className="text-sm text-slate-500">Revizuiește, aprobă sau respinge propunerile trimise de studenți.</p>
            </div>

            <div className="space-y-4">
                <Card className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Propus de: Student Placeholder</span>
                        <span className="rounded bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              În așteptare
            </span>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900">Care este diferența dintre interface și abstract class?</h3>
                        <p className="text-xs text-slate-500 mt-1">Categorie: OOP Basics</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50">
                            Respinge
                        </Button>
                        <Button variant="primary">
                            Aprobă în Catalog
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}