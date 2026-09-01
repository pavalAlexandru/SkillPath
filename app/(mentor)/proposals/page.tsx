import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QuestionForm } from '@/components/mentor/QuestionForm';
import { createClient } from '@/server/supabase/server';
import { approveProposalAction, rejectProposalAction } from '@/server/actions/mentor-proposals';

import { RealtimeQuestions } from './RealtimeQuestions';

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

    const propunereEditata = editId ? questions?.find((q) => q.id === editId) : undefined;

    return (
        <div className="space-y-6">
            <RealtimeQuestions />
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Propuneri Întrebări</h1>
                <p className="text-sm text-slate-500">Revizuiește, aprobă sau respinge propunerile trimise de studenți.</p>
            </div>

            {propunereEditata && (
                <Card className="space-y-4 border-indigo-200 bg-indigo-50/40">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Editează propunerea</h2>
                            <p className="text-sm text-slate-500">
                                Corectează întrebarea înainte de a o aproba. Studentul nu e notificat de modificare.
                            </p>
                        </div>
                        <Link href="/proposals" scroll={false} className="text-sm text-slate-500 hover:underline">
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
                {!questions || questions.length === 0 ? (
                    <Card className="p-6 text-center text-slate-500">
                        Nu există propuneri în așteptare.
                    </Card>
                ) : (
                    questions.map((question) => {
                        const creatorName = question.profiles 
                            ? `${(question.profiles as any).first_name} ${(question.profiles as any).last_name}` 
                            : 'Necunoscut';
                        const categoryName = question.categories 
                            ? (question.categories as any).name 
                            : 'Nespecificată';
                        
                        return (
                            <Card key={question.id} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500">Propus de: {creatorName}</span>
                                    <span className="rounded bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                        În așteptare
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">{question.question_text}</h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Categorie: {categoryName} • Tip: {question.question_type} • Dificultate: {question.difficulty}
                                    </p>
                                </div>
                                
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-slate-700 mb-2">Opțiuni:</h4>
                                    <ul className="space-y-2">
                                        {question.question_options?.map((option: any) => (
                                            <li key={option.id} className="flex items-start gap-2 text-sm">
                                                <span className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border ${
                                                    option.is_correct 
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                                                    : 'border-slate-300'
                                                }`}>
                                                    {option.is_correct && (
                                                        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </span>
                                                <span className={option.is_correct ? 'font-medium text-emerald-700' : 'text-slate-700'}>
                                                    {option.option_text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <Link href={`/proposals?edit=${question.id}`} scroll={false}>
                                        <Button type="button" variant="outline">
                                            Editează
                                        </Button>
                                    </Link>
                                    <form action={rejectProposalAction}>
                                        <input type="hidden" name="questionId" value={question.id} />
                                        <Button type="submit" variant="danger">
                                            Respinge
                                        </Button>
                                    </form>
                                    <form action={approveProposalAction}>
                                        <input type="hidden" name="questionId" value={question.id} />
                                        <Button type="submit" variant="success">
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
