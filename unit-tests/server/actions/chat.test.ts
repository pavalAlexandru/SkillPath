import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRecentMessages, sendMessage } from '@/server/actions/chat';
import * as serverSupabase from '@/server/supabase/server';
import * as nextCache from 'next/cache';

// Mock dependencies
vi.mock('@/server/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Chat Server Actions', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup generic Supabase client mock
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
      }
    };

    (serverSupabase.createClient as any).mockResolvedValue(mockSupabase);
  });

  describe('getRecentMessages', () => {
    it('builds query correctly and formats data', async () => {
      const dbResponse = [
        {
          id: '123',
          content: 'Test content',
          created_at: '2026-09-01T10:00:00Z',
          author: {
            id: 'u1',
            first_name: 'John',
            last_name: 'Doe',
            role: 'STUDENT',
            avatar_url: 'avatar.png'
          }
        }
      ];

      // Since the chain resolves to `{ data, error }`, the final chained method (limit or ilike) needs to resolve to this
      mockSupabase.limit.mockResolvedValue({ data: dbResponse, error: null });

      const messages = await getRecentMessages(10);

      expect(mockSupabase.from).toHaveBeenCalledWith('chat_messages');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockSupabase.limit).toHaveBeenCalledWith(10);

      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe('123');
      expect(messages[0].author.firstName).toBe('John');
      expect(messages[0].author.avatarUrl).toBe('avatar.png');
    });

    it('applies search keyword if provided', async () => {
      mockSupabase.ilike.mockResolvedValue({ data: [], error: null });

      await getRecentMessages(50, 'keyword');

      expect(mockSupabase.ilike).toHaveBeenCalledWith('content', '%keyword%');
    });

    it('returns empty array on error', async () => {
      mockSupabase.limit.mockResolvedValue({ data: null, error: new Error('DB Error') });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const messages = await getRecentMessages(10);
      
      expect(messages).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('sendMessage', () => {
    it('throws error if user is not logged in', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('Auth error') });

      await expect(sendMessage('Hello')).rejects.toThrow('Unauthorized');
    });

    it('inserts message and revalidates path on success', async () => {
      mockSupabase.insert.mockResolvedValue({ error: null });

      await sendMessage('Test content');

      expect(mockSupabase.from).toHaveBeenCalledWith('chat_messages');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        content: 'Test content',
        author_id: 'user-1'
      });
      expect(nextCache.revalidatePath).toHaveBeenCalledWith('/forum');
    });

    it('throws error on database insert failure', async () => {
      mockSupabase.insert.mockResolvedValue({ error: new Error('Insert failed') });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(sendMessage('Fail message')).rejects.toThrow('Failed to send message');
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
