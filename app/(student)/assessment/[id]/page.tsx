import { AssessmentRunner } from '@/components/assessment/AssessmentRunner';
import { getAssessmentQuestions } from '@/server/supabase/assessmentService';

export default async function AssessmentPage({
                                                 params,
                                             }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const questions = await getAssessmentQuestions(id, 10);

    if (!questions || questions.length === 0) {
        return (
            <div className="mx-auto max-w-xl p-8 text-center bg-white rounded-xl border border-slate-200 space-y-3">
                <h2 className="text-lg font-bold text-slate-900">Nu există întrebări active</h2>
                <p className="text-sm text-slate-500">
                    Nu s-au găsit întrebări aprobate în Supabase pentru selecția curentă.
                </p>
            </div>
        );
    }

    return <AssessmentRunner assessmentId={id} questions={questions} />;
}