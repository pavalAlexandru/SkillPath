import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function AssessmentPage({
                                                 params,
                                             }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <Card className="mx-auto max-w-3xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            Test #{id}
          </span>
                    <h1 className="text-xl font-bold text-slate-900">Întrebarea 1 din 10</h1>
                </div>
                <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          Single Choice
        </span>
            </div>

            {/* Text Întrebare Placeholder */}
            <p className="text-base text-slate-800">
                Care dintre următoarele concepte descrie cel mai bine ascunderea detaliilor de implementare internă?
            </p>

            {/* Opțiuni de răspuns */}
            <div className="space-y-3">
                {[
                    'Moștenire (Inheritance)',
                    'Încapsulare (Encapsulation)',
                    'Polimorfism (Polymorphism)',
                    'Abstractizare (Abstraction)',
                ].map((opt, idx) => (
                    <label
                        key={idx}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all"
                    >
                        <input
                            type="radio"
                            name="question-opt"
                            className="h-4 w-4 text-indigo-600"
                        />
                        <span className="text-sm text-slate-800">{opt}</span>
                    </label>
                ))}
            </div>

            <div className="flex justify-end pt-4">
                <Button variant="primary">
                    Următoarea Întrebare
                </Button>
            </div>
        </Card>
    );
}