import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notifyQuestionOutcome, getUserNotifications, deleteNotification } from '@/server/actions/notifications';

const mocks = vi.hoisted(() => ({
  fromMock: vi.fn(),
  selectMock: vi.fn(),
  eqMock: vi.fn(),
  singleMock: vi.fn(),
  insertMock: vi.fn(),
  orderMock: vi.fn(),
  updateMock: vi.fn(),
  getUserMock: vi.fn(),
}));

vi.mock('@/server/supabase/server', () => ({
  createClient: () => ({
    from: mocks.fromMock,
    auth: {
      getUser: mocks.getUserMock,
    },
  }),
}));

describe('notifications actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.fromMock.mockReturnValue({
      select: mocks.selectMock,
      insert: mocks.insertMock,
      update: mocks.updateMock,
    });

    mocks.updateMock.mockReturnValue({
      eq: mocks.eqMock,
    });

    mocks.selectMock.mockReturnValue({
      eq: mocks.eqMock,
    });
    
    mocks.eqMock.mockReturnValue({
      eq: mocks.eqMock,
      single: mocks.singleMock,
      order: mocks.orderMock,
      select: mocks.selectMock,
    });

    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('notifyQuestionOutcome', () => {
    it('returns early if fetching question fails', async () => {
      mocks.singleMock.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

      await notifyQuestionOutcome(1, 'APPROVED');

      expect(mocks.fromMock).toHaveBeenCalledWith('questions');
      expect(console.error).toHaveBeenCalledWith('Failed to fetch question for notification:', { message: 'Not found' });
      expect(mocks.insertMock).not.toHaveBeenCalled();
    });

    it('inserts a QUESTION_ACCEPTED notification for an approved question', async () => {
      mocks.singleMock.mockResolvedValueOnce({
        data: { created_by: 'user-123', question_text: 'What is React?' },
        error: null,
      });
      mocks.insertMock.mockResolvedValueOnce({ error: null });

      await notifyQuestionOutcome(1, 'APPROVED');

      expect(mocks.insertMock).toHaveBeenCalledWith({
        user_id: 'user-123',
        title: 'Question Approved',
        message: 'Your proposed question "What is React?" has been approved by a mentor.',
        type: 'QUESTION_ACCEPTED',
        reference_id: 1,
      });
    });

    it('truncates long questions in the notification message', async () => {
      mocks.singleMock.mockResolvedValueOnce({
        data: { created_by: 'user-123', question_text: 'a'.repeat(100) },
        error: null,
      });
      mocks.insertMock.mockResolvedValueOnce({ error: null });

      await notifyQuestionOutcome(1, 'REJECTED');

      expect(mocks.insertMock).toHaveBeenCalledWith({
        user_id: 'user-123',
        title: 'Question Rejected',
        message: `Your proposed question "${'a'.repeat(50)}..." was unfortunately rejected.`,
        type: 'QUESTION_REJECTED',
        reference_id: 1,
      });
    });
  });

  describe('getUserNotifications', () => {
    it('returns empty array if user is not authenticated', async () => {
      mocks.getUserMock.mockResolvedValueOnce({ data: { user: null }, error: { message: 'Auth error' } });

      const result = await getUserNotifications();
      
      expect(result).toEqual([]);
      expect(mocks.fromMock).not.toHaveBeenCalled();
    });

    it('fetches notifications for the authenticated user', async () => {
      mocks.getUserMock.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null });
      const mockData = [{ id: 1, title: 'Test' }];
      mocks.orderMock.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await getUserNotifications();

      expect(mocks.fromMock).toHaveBeenCalledWith('notifications');
      expect(mocks.eqMock).toHaveBeenCalledWith('user_id', 'user-1');
      expect(mocks.eqMock).toHaveBeenCalledWith('is_deleted', false);
      expect(mocks.orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockData);
    });
  });

  describe('deleteNotification', () => {
    it('returns error if user is not authenticated', async () => {
      mocks.getUserMock.mockResolvedValueOnce({ data: { user: null }, error: null });

      const result = await deleteNotification(1);

      expect(result).toEqual({ success: false, error: 'Not authenticated' });
      expect(mocks.fromMock).not.toHaveBeenCalled();
    });

    it('returns error if update fails', async () => {
      mocks.getUserMock.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null });
      mocks.selectMock.mockResolvedValueOnce({ data: null, error: { message: 'DB Error' } });

      const result = await deleteNotification(1);

      expect(result).toEqual({ success: false, error: 'DB Error' });
    });

    it('returns error if no rows are updated (RLS or wrong ID)', async () => {
      mocks.getUserMock.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null });
      mocks.selectMock.mockResolvedValueOnce({ data: [], error: null });

      const result = await deleteNotification(1);

      expect(result).toEqual({ success: false, error: 'No rows updated. You might be missing the RLS UPDATE policy.' });
    });

    it('returns success if row is updated successfully', async () => {
      mocks.getUserMock.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null });
      mocks.selectMock.mockResolvedValueOnce({ data: [{ id: 1, is_deleted: true }], error: null });

      const result = await deleteNotification(1);

      expect(result).toEqual({ success: true });
    });
  });
});
