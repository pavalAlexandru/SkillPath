import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationWidget } from '@/components/shared/NotificationWidget';

const mocks = vi.hoisted(() => ({
  usePathnameMock: vi.fn(),
  getUserNotificationsMock: vi.fn(),
  deleteNotificationMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: mocks.usePathnameMock,
}));

vi.mock('@/server/actions/notifications', () => ({
  getUserNotifications: mocks.getUserNotificationsMock,
  deleteNotification: mocks.deleteNotificationMock,
}));

describe('NotificationWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.usePathnameMock.mockReturnValue('/dashboard');
    mocks.getUserNotificationsMock.mockResolvedValue([]);
  });

  it('renders nothing when path includes /assessments', () => {
    mocks.usePathnameMock.mockReturnValue('/assessments/123');
    const { container } = render(<NotificationWidget />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when path includes /test', () => {
    mocks.usePathnameMock.mockReturnValue('/test/abc');
    const { container } = render(<NotificationWidget />);
    expect(container.firstChild).toBeNull();
  });

  it('fetches notifications on mount and renders the bell icon', async () => {
    mocks.getUserNotificationsMock.mockResolvedValue([
      {
        id: 1,
        title: 'Question Approved',
        message: 'Your question was approved.',
        type: 'QUESTION_ACCEPTED',
        created_at: new Date().toISOString(),
      },
    ]);

    render(<NotificationWidget />);

    expect(mocks.getUserNotificationsMock).toHaveBeenCalledTimes(1);

    // Wait for state to update
    await waitFor(() => {
      // Button should be in the document
      const button = screen.getByRole('button', { name: /toggle notifications/i });
      expect(button).toBeDefined();
    });
  });

  it('opens and closes popup when clicked', async () => {
    mocks.getUserNotificationsMock.mockResolvedValue([
      {
        id: 1,
        title: 'Question Approved',
        message: 'Your question was approved.',
        type: 'QUESTION_ACCEPTED',
        created_at: new Date().toISOString(),
      },
    ]);

    render(<NotificationWidget />);

    const button = screen.getByRole('button', { name: /toggle notifications/i });

    // Initially popup is closed
    expect(screen.queryByText('Notifications')).toBeNull();

    // Click to open
    fireEvent.click(button);

    // Now it should be open
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeDefined();
      expect(screen.getByText('Question Approved')).toBeDefined();
    });

    // Click again to close
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.queryByText('Notifications')).toBeNull();
    });
  });

  it('deletes notification optimistically', async () => {
    mocks.getUserNotificationsMock.mockResolvedValue([
      {
        id: 1,
        title: 'Test Notification',
        message: 'Click to delete',
        type: 'SYSTEM',
        created_at: new Date().toISOString(),
      },
    ]);
    mocks.deleteNotificationMock.mockResolvedValue({ success: true });

    render(<NotificationWidget />);

    const toggleButton = screen.getByRole('button', { name: /toggle notifications/i });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('Test Notification')).toBeDefined();
    });

    // Find delete button
    const deleteButton = screen.getByTitle('Delete notification');
    fireEvent.click(deleteButton);

    // Optimistic update should hide it
    await waitFor(() => {
      expect(screen.queryByText('Test Notification')).toBeNull();
    });

    expect(mocks.deleteNotificationMock).toHaveBeenCalledWith(1);
  });
});
