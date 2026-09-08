import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { proposeQuestionAction } from '@/server/actions/proposals';
import { approveProposalAction } from '@/server/actions/mentor-proposals';
import { adminClient, setMockUserRole } from '../vitest.integration.setup';

describe('Question Proposal Integration', () => {
    let createdQuestionIds: number[] = [];
    let testCategoryId = 1;

    beforeAll(async () => {
        const { data: catData } = await adminClient.from('questions').select('category_id').limit(1).single();
        if (catData) testCategoryId = catData.category_id;
    });

    afterAll(async () => {
        // Cleanup all questions and options created during tests
        if (createdQuestionIds.length > 0) {
            await adminClient.from('question_options').delete().in('question_id', createdQuestionIds);
            await adminClient.from('questions').delete().in('id', createdQuestionIds);
        }
        
        // Also cleanup by pattern in case test failed early
        const { data: leakedQuestions } = await adminClient.from('questions').select('id').like('question_text', 'Test Proposal %');
        if (leakedQuestions && leakedQuestions.length > 0) {
            const leakedIds = leakedQuestions.map(q => q.id);
            await adminClient.from('question_options').delete().in('question_id', leakedIds);
            await adminClient.from('questions').delete().in('id', leakedIds);
        }
    });

    test('should allow student to propose and mentor to approve', async () => {
        // 1. Student proposes a question
        setMockUserRole('STUDENT');
        const uniqueText = `Test Proposal ${Date.now()}`;
        
        const proposalResult = await proposeQuestionAction({
            categoryId: testCategoryId,
            questionText: uniqueText,
            difficulty: 'EASY',
            questionType: 'SINGLE',
            options: [
                { text: 'Option A', isCorrect: true },
                { text: 'Option B', isCorrect: false },
                { text: 'Option C', isCorrect: false },
                { text: 'Option D', isCorrect: false },
            ]
        });

        if (proposalResult.error) {
            console.error(proposalResult.error);
        }

        expect(proposalResult.success).toBe(true);

        // Fetch question ID from DB
        const { data: proposedQ } = await adminClient
            .from('questions')
            .select('id, status')
            .eq('question_text', uniqueText)
            .single();

        expect(proposedQ).toBeTruthy();
        expect(proposedQ?.status).toBe('PENDING');
        createdQuestionIds.push(proposedQ!.id);

        // 3. Mentor approves it
        setMockUserRole('MENTOR');
        const fd = new FormData();
        fd.append('questionId', proposedQ!.id.toString());
        
        await approveProposalAction(fd);

        // Verify it is APPROVED
        const { data: approvedQ } = await adminClient
            .from('questions')
            .select('status')
            .eq('id', proposedQ!.id)
            .single();

        expect(approvedQ?.status).toBe('APPROVED');
    });
});
