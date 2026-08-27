import { AssessmentRunner } from '@/components/assessment/AssessmentRunner';
import { getAssessmentQuestions } from '@/server/supabase/assessmentService';
import { getCurrentStudentLevel } from '@/server/supabase/profileService';
import { StudentLevel } from '@/types/assesments';
import { ASSESSMENT_CONFIG } from '@/config/assessmentConfig';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function AssessmentPage({
                                                 params,
                                                 searchParams,
                                             }: {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ level?: string }>;
}) {
    const { id } = await params;
    const resolvedSearchParams = searchParams ? await searchParams : {};

    // Dacă URL-ul are ?level=MIDDLE sau ?level=SENIOR, îl folosim prioritar
    const paramLevel = resolvedSearchParams?.level?.toUpperCase() as StudentLevel | undefined;
    const dbLevel = await getCurrentStudentLevel();
    const effectiveLevel: StudentLevel = paramLevel || dbLevel || 'JUNIOR';

    // Folosim numărul de întrebări configurat în assessmentConfig
    const limit = id === 'onboarding'
        ? ASSESSMENT_CONFIG.onboardingQuestionCount
        : ASSESSMENT_CONFIG.standardQuestionCount;

    // Pasăm nivelul explicit către serviciul de întrebări
    const questions = await getAssessmentQuestions(
        id === 'onboarding' ? 'onboarding' : id,
        limit,
        effectiveLevel
    );

    if (!questions || questions.length === 0) {
        return (
            <div className="mx-auto max-w-xl p-8 text-center bg-white rounded-xl border border-slate-200 space-y-3">
                <h2 className="text-lg font-bold text-slate-900">Nu există întrebări active</h2>
                <p className="text-sm text-slate-500">
                    Nu s-au găsit întrebări aprobate în baza de date pentru nivelul {effectiveLevel}.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {id === 'onboarding' && (
                <div className="mx-auto max-w-3xl rounded-2xl bg-indigo-50 border border-indigo-200 p-4 text-center">
                    <h1 className="text-base font-bold text-indigo-900">
                        Test Adaptiv de Plasare — Nivel Evaluat: <span className="underline font-extrabold">{effectiveLevel}</span>
                    </h1>
                    <p className="text-xs text-indigo-700 mt-1">
                        Răspunde corect la cele {limit} întrebări (≥{ASSESSMENT_CONFIG.passingScorePercentage}%) pentru a debloca nivelul următor!
                    </p>
                </div>
            )}
            <AssessmentRunner assessmentId={id} questions={questions} />
        </div>
    );
}