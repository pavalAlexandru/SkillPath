import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatCanvas from '@/components/chat/ChatCanvas';
import * as chatActions from '@/server/actions/chat';
import * as navigation from 'next/navigation';
import * as supabaseClient from '@/server/supabase/client';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/server/supabase/client', () => ({
  getSupabaseClient: vi.fn(),
}));

vi.mock('@/server/actions/chat', () => ({
  sendMessage: vi.fn(),
  getRecentMessages: vi.fn(),
}));

// Mock useTransition (React 18+)
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useTransition: () => [false, (cb: any) => cb()],
  };
});

describe('ChatCanvas Component', () => {
  const mockMessages = [
    {
      id: 'msg-1',
      content: 'Hello forum!',
      createdAt: new Date('2026-09-01T10:00:00Z').toISOString(),
      author: {
        id: 'user-1',
        firstName: 'Alice',
        lastName: 'Smith',
        role: 'STUDENT',email: 'student@example.com',avatarUrl: null, joinedAt: '2026-08-01T10:00:00.000Z'
      }
    },
    {
      id: 'msg-2',
      content: 'I need help with Next.js',
      createdAt: new Date('2026-09-01T10:05:00Z').toISOString(),
      author: {
        id: 'user-2',
        firstName: 'Bob',
        lastName: 'Mentor',
        role: 'MENTOR',email: 'mentor@example.com',avatarUrl: 'https://example.com/avatar.png', joinedAt: '2025-05-10T10:00:00.000Z'
      }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup router mock
    (navigation.useRouter as any).mockReturnValue({
      push: vi.fn(),
      refresh: vi.fn(),
    });

    // Setup supabase real-time channel mock
    (supabaseClient.getSupabaseClient as any).mockReturnValue({
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
      }),
      removeChannel: vi.fn(),
    });
  });

  it('renders initial messages correctly', () => {
    render(
      <ChatCanvas 
        initialMessages={mockMessages} 
        currentUserId="user-1" 
        currentUserProfile={{}} 
        searchKeyword="" 
      />
    );

    // Assert messages are rendered
    expect(screen.getByText('Hello forum!')).toBeInTheDocument();
    expect(screen.getByText('I need help with Next.js')).toBeInTheDocument();

    // Assert author names are rendered
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Mentor')).toBeInTheDocument();
    
    // Assert roles are rendered
    expect(screen.getByText('Student')).toBeInTheDocument();
    expect(screen.getByText('Mentor')).toBeInTheDocument();
  });

  it('renders empty state when there are no messages', () => {
    render(
      <ChatCanvas 
        initialMessages={[]} 
        currentUserId="user-1" 
        currentUserProfile={{}} 
        searchKeyword="" 
      />
    );

    expect(screen.getByText(/No posts found in this thread yet/i)).toBeInTheDocument();
  });

  it('allows user to type and send a new message', async () => {
    (chatActions.sendMessage as any).mockResolvedValue(undefined);

    render(
      <ChatCanvas 
        initialMessages={[]} 
        currentUserId="user-1" 
        currentUserProfile={{ first_name: 'Alice', role: 'STUDENT' }} 
        searchKeyword="" 
      />
    );

    const input = screen.getByPlaceholderText(/Type your reply here/i);
    const button = screen.getByRole('button', { name: /Post Reply/i });

    // Initial state
    expect(button).toBeDisabled();

    // Type a message
    fireEvent.change(input, { target: { value: 'New Test Message' } });
    expect(button).not.toBeDisabled();

    // Submit form
    fireEvent.click(button);

    // Verify Server Action is called
    await waitFor(() => {
      expect(chatActions.sendMessage).toHaveBeenCalledWith('New Test Message');
    });

    // Verify optimistic UI clears input
    expect(input).toHaveValue('');
    
    // Verify optimistic message is added to DOM
    expect(screen.getByText('New Test Message')).toBeInTheDocument();
  });

  it('highlights search keywords', () => {
    render(
      <ChatCanvas 
        initialMessages={mockMessages} 
        currentUserId="user-1" 
        currentUserProfile={{}} 
        searchKeyword="Next.js" 
      />
    );

    const highlightedEl = screen.getByText('Next.js');
    expect(highlightedEl.tagName.toLowerCase()).toBe('mark');
  });

  it('triggers search routing on search submit', () => {
    const pushMock = vi.fn();
    (navigation.useRouter as any).mockReturnValue({ push: pushMock });

    render(
      <ChatCanvas 
        initialMessages={mockMessages} 
        currentUserId="user-1" 
        currentUserProfile={{}} 
        searchKeyword="" 
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search thread/i);
    fireEvent.change(searchInput, { target: { value: 'help' } });
    
    const searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);

    expect(pushMock).toHaveBeenCalledWith('/forum?search=help');
  });
});
