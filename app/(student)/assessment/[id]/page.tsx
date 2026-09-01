import { AssessmentRunner } from '@/components/assessment/AssessmentRunner';
import { getAssessmentQuestions } from '@/server/supabase/assessmentService';
import { getCurrentStudentLevel } from '@/server/supabase/profileService';
import { StudentLevel } from '@/types/assesments';
import { ASSESSMENT_CONFIG } from '@/config/assessmentConfig';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function AssessmentExecutionPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ level?: string }>;
}) {
    const { id } = await params;
    const resolvedSearchParams = searchParams ? await searchParams : {};

    const paramLevel = resolvedSearchParams?.level?.toUpperCase() as StudentLevel | undefined;
    const dbLevel = await getCurrentStudentLevel();
    const effectiveLevel: StudentLevel = paramLevel || dbLevel || 'JUNIOR';

    const limit = id === 'onboarding'
        ? ASSESSMENT_CONFIG.onboardingQuestionCount
        : ASSESSMENT_CONFIG.standardQuestionCount;

    const questions = await getAssessmentQuestions(
        id === 'onboarding' ? 'onboarding' : id,
        limit,
        effectiveLevel
    );

    if (!questions || questions.length === 0) {
        return (
            <div className="mx-auto max-w-xl space-y-3 rounded-2xl border border-slate-200/80 bg-white/90 p-8 text-center backdrop-blur-xl shadow-md dark:border-slate-800/80 dark:bg-slate-900/80">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nu există întrebări active</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Nu s-au găsit întrebări aprobate în baza de date pentru nivelul {effectiveLevel}.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {id === 'onboarding' && (
                <div className="mx-auto max-w-4xl rounded-2xl border border-indigo-200/80 bg-indigo-50/80 p-5 text-center backdrop-blur-md shadow-xs dark:border-indigo-900/50 dark:bg-indigo-950/40">
                    <h1 className="text-base font-bold text-indigo-950 dark:text-indigo-200">
                        Test Adaptiv de Plasare — Nivel Evaluat: <span className="underline font-extrabold">{effectiveLevel}</span>
                    </h1>
                    <p className="mt-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                        Răspunde corect la cele {limit} întrebări (≥{ASSESSMENT_CONFIG.passingScorePercentage}%) pentru a debloca nivelul următor!
                    </p>
                </div>
            )}
            <AssessmentRunner assessmentId={id} questions={questions} />
        </div>
    );
}