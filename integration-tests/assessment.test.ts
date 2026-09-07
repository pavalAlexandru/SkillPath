import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { saveCompletedAssessment, getUserCategoryProgress } from '@/server/supabase/assessmentService';
import { adminClient, studentClient, setMockUserRole } from '../vitest.integration.setup';

describe('Assessment Integration', () => {
    let studentUserId: string;
    let createdAssessmentIds: number[] = [];

    beforeAll(async () => {
        setMockUserRole('STUDENT');
        const { data: { user } } = await studentClient.auth.getUser();
        studentUserId = user!.id;
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

    test('should save completed assessment and update progress', async () => {
        const { data: catData } = await adminClient.from('questions').select('category_id').limit(1).single();
        const categoryId = catData?.category_id || 1;

        // Fetch some real questions from DB for category 1
        const { data: questionsData } = await adminClient
            .from('questions')
            .select(`
                id, category_id, question_text, difficulty, question_type,
                options:question_options (id, option_text, is_correct)
            `)
            .eq('category_id', categoryId)
            .limit(2);
            
        expect(questionsData).toBeTruthy();
        expect(questionsData!.length).toBeGreaterThan(0);

        // Format questions
        const formattedQuestions = questionsData!.map(q => ({
            id: Number(q.id),
            categoryId: Number(q.category_id),
            questionText: q.question_text,
            difficulty: q.difficulty as any,
            questionType: q.question_type as any,
            options: q.options
        }));

        // Select the correct answers to get 100%
        const answers: Record<number, number[]> = {};
        for (const q of formattedQuestions) {
            const correctOption = q.options.find((o: any) => o.is_correct);
            if (correctOption) {
                answers[q.id] = [correctOption.id];
            }
        }

        const assessmentId = await saveCompletedAssessment(categoryId, 100, answers, formattedQuestions);
        expect(assessmentId).not.toBeNull();
        expect(assessmentId).not.toBe(9999); // verify not mocked
        
        if (assessmentId) createdAssessmentIds.push(assessmentId);

        // Verify it was saved correctly in DB
        const { data: assessmentData } = await adminClient
            .from('assessments')
            .select('*')
            .eq('id', assessmentId)
            .single();

        expect(assessmentData).toBeTruthy();
        expect(assessmentData?.user_id).toBe(studentUserId);
        expect(assessmentData?.total_score).toBe(100);

        // Check progress
        const progress = await getUserCategoryProgress();
        expect(progress[categoryId]).toBeDefined();
        expect(progress[categoryId].lastScore).toBe(100);
        expect(progress[categoryId].passed).toBe(true);
    });
});
