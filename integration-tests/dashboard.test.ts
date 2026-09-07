import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { getStudentDashboardData } from '@/server/supabase/dashboardService';
import { saveCompletedAssessment } from '@/server/supabase/assessmentService';
import { adminClient, studentClient, setMockUserRole } from '../vitest.integration.setup';

describe('Dashboard Integration', () => {
    let studentUserId: string;
    let createdAssessmentIds: number[] = [];
    let initialDashboardData: any;

    beforeAll(async () => {
        setMockUserRole('STUDENT');
        const { data: { user } } = await studentClient.auth.getUser();
        studentUserId = user!.id;
        
        initialDashboardData = await getStudentDashboardData();
    });

    afterAll(async () => {
        // Cleanup all assessments created during tests
        if (createdAssessmentIds.length > 0) {
            await adminClient.from('assessment_answers').delete().in('assessment_question_id', 
                (await adminClient.from('assessment_questions').select('id').in('assessment_id', createdAssessmentIds)).data?.map(q => q.id) || []
            );
            await adminClient.from('assessment_questions').delete().in('assessment_id', createdAssessmentIds);
            await adminClient.from('assessment_categories').delete().in('assessment_id', createdAssessmentIds);
            await adminClient.from('assessment_category_scores').delete().in('assessment_id', createdAssessmentIds);
            await adminClient.from('assessments').delete().in('id', createdAssessmentIds);
        }
    });

    test('dashboard stats should update after an assessment', async () => {
        const { data: catData } = await adminClient.from('questions').select('category_id').limit(1).single();
        const categoryId = catData?.category_id || 1;

        // Fetch dummy questions to create an assessment
        const { data: questionsData } = await adminClient
            .from('questions')
            .select(`
                id, category_id, question_text, difficulty, question_type,
                options:question_options (id, option_text, is_correct)
            `)
            .eq('category_id', categoryId)
            .limit(1);

        const formattedQuestions = questionsData!.map(q => ({
            id: Number(q.id),
            categoryId: Number(q.category_id),
            questionText: String(q.question_text),
            difficulty: q.difficulty as any,
            questionType: q.question_type as any,
            options: q.options.map((opt: any) => ({
                id: Number(opt.id),
                questionId: Number(q.id),
                optionText: String(opt.option_text),
                isCorrect: Boolean(opt.is_correct)
            }))
        }));

        const answers = { [formattedQuestions[0].id]: [formattedQuestions[0].options.find((o: any) => o.isCorrect)!.id] };

        // Save assessment
        const assessmentId = await saveCompletedAssessment(categoryId, 100, answers, formattedQuestions);
        if (assessmentId) createdAssessmentIds.push(assessmentId);

        // Fetch dashboard again
        const newDashboardData = await getStudentDashboardData();
        
        expect(newDashboardData).toBeDefined();
        // Tests completed should increase by 1
        expect(newDashboardData!.testsCompleted).toBe(initialDashboardData.testsCompleted + 1);
        
        // At least one category passed since we just scored 100
        expect(newDashboardData!.categoriesPassed).toBeGreaterThanOrEqual(1);
    });
});
