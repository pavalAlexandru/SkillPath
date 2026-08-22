import { describe, it, expect, vi, beforeEach } from 'vitest';
import { approveProposalAction, rejectProposalAction } from '@/server/actions/mentor-proposals';

const mocks = vi.hoisted(() => ({
    fromMock: vi.fn(),
    updateMock: vi.fn(),
    deleteMock: vi.fn(),
    eqMock: vi.fn(),
    revalidatePathMock: vi.fn(),
}));

vi.mock('@/server/supabase/server', () => ({
    createClient: () => ({
        from: mocks.fromMock,
    })
}));

vi.mock('next/cache', () => ({
    revalidatePath: mocks.revalidatePathMock,
}));

describe('mentor-proposals actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        mocks.fromMock.mockReturnValue({
            update: mocks.updateMock,
            delete: mocks.deleteMock,
        });
        
        mocks.updateMock.mockReturnValue({
            eq: mocks.eqMock,
        });

        mocks.deleteMock.mockReturnValue({
            eq: mocks.eqMock,
        });
        
        mocks.eqMock.mockResolvedValue({ error: null });
        
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('approveProposalAction', () => {
        it('returns early if questionId is invalid', async () => {
            const formData = new FormData();
            await approveProposalAction(formData);
            
            expect(mocks.fromMock).not.toHaveBeenCalled();
            expect(mocks.revalidatePathMock).not.toHaveBeenCalled();
        });

        it('updates status to APPROVED and is_active to true', async () => {
            const formData = new FormData();
            formData.append('questionId', '123');

            await approveProposalAction(formData);

            expect(mocks.fromMock).toHaveBeenCalledWith('questions');
            expect(mocks.updateMock).toHaveBeenCalledWith({ status: 'APPROVED', is_active: true });
            expect(mocks.eqMock).toHaveBeenCalledWith('id', 123);
            expect(mocks.revalidatePathMock).toHaveBeenCalledWith('/proposals');
        });

        it('logs an error if update fails', async () => {
            mocks.eqMock.mockResolvedValueOnce({ error: { message: 'DB update failed' } });
            
            const formData = new FormData();
            formData.append('questionId', '456');

            await approveProposalAction(formData);

            expect(console.error).toHaveBeenCalledWith('Error approving proposal:', { message: 'DB update failed' });
            expect(mocks.revalidatePathMock).toHaveBeenCalledWith('/proposals');
        });
    });

    describe('rejectProposalAction', () => {
        it('returns early if questionId is invalid', async () => {
            const formData = new FormData();
            await rejectProposalAction(formData);
            
            expect(mocks.fromMock).not.toHaveBeenCalled();
            expect(mocks.revalidatePathMock).not.toHaveBeenCalled();
        });

        it('deletes question options first, then the question', async () => {
            const formData = new FormData();
            formData.append('questionId', '789');

            await rejectProposalAction(formData);

            expect(mocks.fromMock).toHaveBeenNthCalledWith(1, 'question_options');
            expect(mocks.fromMock).toHaveBeenNthCalledWith(2, 'questions');
            
            expect(mocks.deleteMock).toHaveBeenCalledTimes(2);
            
            expect(mocks.eqMock).toHaveBeenNthCalledWith(1, 'question_id', 789);
            expect(mocks.eqMock).toHaveBeenNthCalledWith(2, 'id', 789);
            
            expect(mocks.revalidatePathMock).toHaveBeenCalledWith('/proposals');
        });

        it('logs errors if deletions fail', async () => {
            // first call returns error for options, second for question
            mocks.eqMock
                .mockResolvedValueOnce({ error: { message: 'Failed to delete options' } })
                .mockResolvedValueOnce({ error: { message: 'Failed to delete question' } });
            
            const formData = new FormData();
            formData.append('questionId', '999');

            await rejectProposalAction(formData);

            expect(console.error).toHaveBeenCalledWith('Error deleting proposal options:', { message: 'Failed to delete options' });
            expect(console.error).toHaveBeenCalledWith('Error deleting proposal:', { message: 'Failed to delete question' });
            expect(mocks.revalidatePathMock).toHaveBeenCalledWith('/proposals');
        });
    });
});
