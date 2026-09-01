import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QuestionForm } from '@/components/mentor/QuestionForm';
import { createClient } from '@/server/supabase/server';
import { approveProposalAction, rejectProposalAction } from '@/server/actions/mentor-proposals';
import { RealtimeQuestions } from './RealtimeQuestions';

interface ProfileInfo {
    first_name: string | null;
    last_name: string | null;
}

interface CategoryInfo {
    name: string;
}

interface OptionInfo {
    id: number;
    option_text: string;
    is_correct: boolean;
}

interface QuestionProposal {
    id: number;
    question_text: string;
    category_id: number;
    difficulty: string;
    question_type: string;
    categories: CategoryInfo | null;
    profiles: ProfileInfo | null;
    question_options: OptionInfo[];
}

export default async function MentorProposalsPage({
    searchParams,
}: {
    searchParams: Promise<{ edit?: string }>;
}) {
    const params = await searchParams;
    const editId = params.edit ? Number(params.edit) : null;

    const supabase = await createClient();

    const [{ data: questions, error }, { data: categories }] = await Promise.all([
        supabase
            .from('questions')
            .select(`
                id,
                question_text,
                category_id,
                difficulty,
                question_type,
                categories (name),
                profiles (first_name, last_name),
                question_options (id, option_text, is_correct)
            `)
            .eq('status', 'PENDING')
            .order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name').eq('is_active', true).order('name'),
    ]);

    if (error) {
        console.error('Error fetching proposals:', error);
    }

    const proposalsList = (questions ?? []) as unknown as QuestionProposal[];
    const propunereEditata = editId ? proposalsList.find((q) => q.id === editId) : undefined;

    return (
        <div className="w-full space-y-6">
            <RealtimeQuestions />
            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Propuneri Întrebări</h1>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Revizuiește, aprobă sau respinge propunerile trimise de studenți.
                </p>
            </div>

            {propunereEditata && (
                <Card className="space-y-4 border border-indigo-100/90 bg-indigo-50/40 p-6 backdrop-blur-md shadow-xs dark:border-indigo-900/50 dark:bg-indigo-950/20">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">Editează propunerea</h2>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                Corectează întrebarea înainte de a o aproba. Studentul nu este notificat de modificare.
                            </p>
                        </div>
                        <Link href="/proposals" scroll={false} className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline dark:text-slate-400 dark:hover:text-slate-200">
                            Renunță
                        </Link>
                    </div>

                    <QuestionForm
                        categories={categories ?? []}
                        question={{
                            id: propunereEditata.id,
                            question_text: propunereEditata.question_text,
                            category_id: propunereEditata.category_id,
                            difficulty: propunereEditata.difficulty,
                            question_type: propunereEditata.question_type,
                            question_options: propunereEditata.question_options ?? [],
                        }}
                    />
                </Card>
            )}

            <div className="space-y-4">
                {!proposalsList || proposalsList.length === 0 ? (
                    <Card className="border border-slate-200/80 bg-white/80 p-8 text-center text-sm font-medium text-slate-500 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 dark:text-slate-400">
                        Nu există propuneri în așteptare.
                    </Card>
                ) : (
                    proposalsList.map((question) => {
                        const creatorName = question.profiles
                            ? `${question.profiles.first_name ?? ''} ${question.profiles.last_name ?? ''}`.trim() || 'Necunoscut'
                            : 'Necunoscut';
                        const categoryName = question.categories?.name ?? 'Nespecificată';

                        return (
                            <Card key={question.id} className="space-y-4 border border-slate-200/80 bg-white/80 p-6 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        Propus de: <strong className="text-slate-700 dark:text-slate-200">{creatorName}</strong>
                                    </span>
                                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300">
                                        În așteptare
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{question.question_text}</h3>
                                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                                        Categorie: <span className="text-slate-700 dark:text-slate-300">{categoryName}</span> • Tip: <span className="text-slate-700 dark:text-slate-300">{question.question_type}</span> • Dificultate: <span className="text-slate-700 dark:text-slate-300">{question.difficulty}</span>
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Opțiuni:</h4>
                                    <ul className="space-y-2">
                                        {question.question_options?.map((option) => (
                                            <li key={option.id} className="flex items-start gap-2.5 text-sm">
                                                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                                    option.is_correct
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                                                        : 'border-slate-300 dark:border-slate-700'
                                                }`}>
                                                    {option.is_correct && (
                                                        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </span>
                                                <span className={option.is_correct ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}>
                                                    {option.option_text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                                    <Link href={`/proposals?edit=${question.id}`} scroll={false}>
                                        <Button type="button" variant="outline" className="px-3.5 py-2 text-xs font-bold">
                                            Editează
                                        </Button>
                                    </Link>
                                    <form action={rejectProposalAction}>
                                        <input type="hidden" name="questionId" value={question.id} />
                                        <Button type="submit" variant="danger" className="px-3.5 py-2 text-xs font-bold">
                                            Respinge
                                        </Button>
                                    </form>
                                    <form action={approveProposalAction}>
                                        <input type="hidden" name="questionId" value={question.id} />
                                        <Button type="submit" variant="success" className="px-3.5 py-2 text-xs font-bold">
                                            Aprobă
                                        </Button>
                                    </form>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}