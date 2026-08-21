import { describe, it, expect, vi, beforeEach } from 'vitest';
import { completeAssessmentAction } from '@/server/actions/assessment';
import { saveCompletedAssessment } from '@/server/supabase/assessmentService';
import { revalidatePath } from 'next/cache';

vi.mock('@/server/supabase/assessmentService');
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

describe('completeAssessmentAction Server Action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('apelează saveCompletedAssessment și revalidează rutele relevante', async () => {
        vi.mocked(saveCompletedAssessment).mockResolvedValue(123);

        const answers = { 1: [10] };
        const questions: any[] = [{ id: 1, options: [] }];

        await completeAssessmentAction('1', 80, answers, questions);

        expect(saveCompletedAssessment).toHaveBeenCalledWith('1', 80, answers, questions);
        expect(revalidatePath).toHaveBeenCalledWith('/assessment');
        expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });
});