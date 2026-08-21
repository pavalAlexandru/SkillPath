import { Card } from '@/components/ui/Card';
import { createClient } from '@/server/supabase/server';
import ProposeForm from '@/components/student/ProposeForm';

export default async function ProposeQuestionPage() {
    const supabase = await createClient();
    const { data: categories } = await supabase.from('categories').select('*').eq('is_active', true);

    return (
        <Card className="mx-auto max-w-2xl p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Propune o Întrebare</h1>
                <p className="text-sm text-slate-500">Contribuie la catalogul de întrebări. Propunerea va fi revizuită de un mentor.</p>
            </div>
            
            <ProposeForm categories={categories || []} />
        </Card>
    );
}