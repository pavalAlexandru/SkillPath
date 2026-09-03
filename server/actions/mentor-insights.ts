'use server';

import { createClient } from '@/server/supabase/server';
import { generateContentWithFallback } from './ai-fallback';
import { revalidatePath } from 'next/cache';

export interface OptionStat {
    id: number;
    text: string;
    isCorrect: boolean;
    timesChosen: number;
    percentage: number;
}

export interface ProblematicQuestion {
    questionId: number;
    questionText: string;
    difficulty: string;
    categoryId: number;
    categoryName: string;
    totalAttempts: number;
    wrongAttempts: number;
    failureRate: number;
    optionsStats: OptionStat[];
    insight?: {
        whyFailed: string;
        distractorAnalysis: string;
        suggestedRefinement: string;
        analyzedAt: string;
    } | null;
}

interface RawOption {
    id: number;
    option_text: string;
    is_correct: boolean;
}

interface RawQuestion {
    id: number;
    question_text: string;
    difficulty: string;
    category_id: number;
    categories: { id: number; name: string } | null;
    options: RawOption[];
}

interface RawAnswerItem {
    option_id: number;
}

interface RawAssessmentQuestionRow {
    id: number;
    question_id: number;
    is_correct: boolean | null;
    question: RawQuestion | null;
    answers: RawAnswerItem[];
}

export interface DbInsightRow {
    question_id: number;
    why_failed: string;
    distractor_analysis: string;
    suggested_refinement: string;
    analyzed_at: string;
}

interface InsightsDbClient {
    from: (table: string) => {
        select: (columns?: string) => {
            in: (column: string, values: number[]) => Promise<{ data: DbInsightRow[] | null; error: unknown }>;
        };
        upsert: (values: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
    };
}

export async function getTopProblematicQuestions(categoryIdFilter?: number): Promise<ProblematicQuestion[]> {
    const supabase = await createClient();

    const { data: rawRows, error } = await supabase
        .from('assessment_questions')
        .select(`
            id,
            question_id,
            is_correct,
            question:questions (
                id,
                question_text,
                difficulty,
                category_id,
                categories ( id, name ),
                options:question_options ( id, option_text, is_correct )
            ),
            assessment:assessments!inner ( status ),
            answers:assessment_answers ( option_id )
        `)
        .eq('assessments.status', 'COMPLETED')
        .not('is_correct', 'is', null);

    if (error || !rawRows || rawRows.length === 0) {
        return [];
    }

    const answeredQuestions = rawRows as unknown as RawAssessmentQuestionRow[];

    const questionStatsMap = new Map<number, {
        question: RawQuestion;
        total: number;
        wrong: number;
        chosenOptionCounts: Map<number, number>;
    }>();

    for (const aq of answeredQuestions) {
        const q = aq.question;
        if (!q) continue;
        if (categoryIdFilter && q.category_id !== categoryIdFilter) continue;

        if (!questionStatsMap.has(q.id)) {
            questionStatsMap.set(q.id, {
                question: q,
                total: 0,
                wrong: 0,
                chosenOptionCounts: new Map<number, number>(),
            });
        }

        const stat = questionStatsMap.get(q.id);
        if (!stat) continue;

        stat.total += 1;
        if (!aq.is_correct) {
            stat.wrong += 1;
        }

        for (const ans of aq.answers) {
            const count = stat.chosenOptionCounts.get(ans.option_id) ?? 0;
            stat.chosenOptionCounts.set(ans.option_id, count + 1);
        }
    }

    const sorted = Array.from(questionStatsMap.values())
        .filter((s) => s.wrong > 0)
        .sort((a, b) => {
            if (b.wrong !== a.wrong) return b.wrong - a.wrong;
            return (b.wrong / b.total) - (a.wrong / a.total);
        })
        .slice(0, 5);

    if (sorted.length === 0) return [];

    const questionIds = sorted.map((s) => s.question.id);

    const customClient = supabase as unknown as InsightsDbClient;
    const { data: rawInsights } = await customClient
        .from('question_ai_insights')
        .select('*')
        .in('question_id', questionIds);

    const insightsList = rawInsights ?? [];
    const insightsMap = new Map<number, DbInsightRow>(
        insightsList.map((ins) => [ins.question_id, ins])
    );

    return sorted.map((s) => {
        const q = s.question;
        const totalAnswerPicks = Array.from(s.chosenOptionCounts.values()).reduce((acc, v) => acc + v, 0);

        const optionsStats: OptionStat[] = (q.options ?? []).map((opt) => {
            const picks = s.chosenOptionCounts.get(opt.id) ?? 0;
            return {
                id: opt.id,
                text: opt.option_text,
                isCorrect: opt.is_correct,
                timesChosen: picks,
                percentage: totalAnswerPicks > 0 ? Math.round((picks / totalAnswerPicks) * 100) : 0,
            };
        });

        const ins = insightsMap.get(q.id);

        return {
            questionId: q.id,
            questionText: q.question_text,
            difficulty: q.difficulty,
            categoryId: q.category_id,
            categoryName: q.categories?.name ?? 'Necunoscută',
            totalAttempts: s.total,
            wrongAttempts: s.wrong,
            failureRate: Math.round((s.wrong / s.total) * 100),
            optionsStats,
            insight: ins ? {
                whyFailed: ins.why_failed,
                distractorAnalysis: ins.distractor_analysis,
                suggestedRefinement: ins.suggested_refinement,
                analyzedAt: ins.analyzed_at,
            } : null,
        };
    });
}

/**
 * Generează analiza pentru o singură întrebare
 */
export async function generateSingleQuestionInsight(
    question: ProblematicQuestion
): Promise<{ success: boolean; insight?: DbInsightRow; error?: string }> {
    const supabase = await createClient();
    const customClient = supabase as unknown as InsightsDbClient;

    const prompt = `
Ești un evaluator tehnic de conținut pentru o platformă educațională de informatică.
Analizează succint de ce greșesc studenții la această întrebare:
Întrebare: "${question.questionText}"
Categorie: ${question.categoryName} | Dificultate: ${question.difficulty}
Rată eșec: ${question.failureRate}% (${question.wrongAttempts}/${question.totalAttempts} încercări greșite)
Opțiuni:
${question.optionsStats.map((o) => `- "${o.text}" (${o.isCorrect ? 'CORECT' : 'GREȘIT'}, ales de ${o.percentage}% dintre studenți)`).join('\n')}

Răspunde STRICT în format JSON valid cu aceste 3 chei:
{
  "why_failed": "Explicație concisă (1-2 fraze) despre confuzia tehnică sau neclaritatea întrebării.",
  "distractor_analysis": "De ce varianta greșită aleasă cel mai des i-a păcălit.",
  "suggested_refinement": "Cum poate fi reformulată întrebarea sau variantele în catalog pentru a fi clară."
}
`;

    try {
        const response = await generateContentWithFallback(prompt, {
            responseMimeType: 'application/json',
        });

        const rawText = response.text?.trim() ?? '{}';
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson) as {
            why_failed?: string;
            distractor_analysis?: string;
            suggested_refinement?: string;
        };

        const insightData: DbInsightRow = {
            question_id: question.questionId,
            why_failed: parsed.why_failed || 'Confuzie tehnică frecventă identificată.',
            distractor_analysis: parsed.distractor_analysis || 'Opțiunea greșită induce în eroare prin termeni apropiați.',
            suggested_refinement: parsed.suggested_refinement || 'Reformulați enunțul pentru a elimina ambiguitățile.',
            analyzed_at: new Date().toISOString(),
        };

        await customClient.from('question_ai_insights').upsert({
            question_id: insightData.question_id,
            why_failed: insightData.why_failed,
            distractor_analysis: insightData.distractor_analysis,
            suggested_refinement: insightData.suggested_refinement,
            analyzed_at: insightData.analyzed_at,
        });

        return { success: true, insight: insightData };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Eroare la generare';
        return { success: false, error: message };
    }
}

/**
 * Generează analizele pentru toate întrebările secvențial (una după alta) pentru a evita erorile 503
 */
export async function generateAllBatchInsights(
    questions: ProblematicQuestion[]
): Promise<{ success: boolean; error?: string }> {
    for (const q of questions) {
        await generateSingleQuestionInsight(q);
        // Pauză de 300ms între apeluri pentru stabilitatea cotei API
        await new Promise((resolve) => setTimeout(resolve, 300));
    }

    revalidatePath('/overview');
    return { success: true };
}