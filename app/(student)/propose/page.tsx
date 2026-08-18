import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ProposeQuestionPage() {
    return (
        <Card className="mx-auto max-w-2xl p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Propune o Întrebare</h1>
                <p className="text-sm text-slate-500">Contribuie la catalogul de întrebări. Propunerea va fi revizuită de un mentor.</p>
            </div>

            <form className="space-y-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700">Categorie</label>
                    <select
                        id="category"
                        name="category"
                        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        <option value="oop">OOP Basics</option>
                        <option value="git">Git</option>
                        <option value="sql">Databases / SQL</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="question" className="block text-sm font-medium text-slate-700">Enunțul Întrebării</label>
                    <textarea
                        id="question"
                        name="question"
                        rows={3}
                        placeholder="Scrie textul întrebării..."
                        required
                        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>

                <Button type="submit" variant="primary">
                    Trimite spre aprobare
                </Button>
            </form>
        </Card>
    );
}