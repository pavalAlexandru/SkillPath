'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getUserNotifications, deleteNotification } from '@/server/actions/notifications';

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  created_at: string;
};

export function NotificationWidget() {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await getUserNotifications();
      if (data) {
        setNotifications(data as unknown as Notification[]);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Refetch when window regains focus
    const handleFocus = () => fetchNotifications();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Hide entirely in assessments/tests
  if (pathname?.includes('/assessments') || pathname?.includes('/test')) {
    return null;
  }

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic update
    const previousNotifications = [...notifications];
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    try {
      const res = await deleteNotification(id);
      if (res && !res.success) {
        console.error('Deletion failed:', res.error);
        // Revert optimistic update
        setNotifications(previousNotifications);
      }
    } catch (err) {
      console.error('Exception during deletion:', err);
      // Revert optimistic update
      setNotifications(previousNotifications);
    }
  };

  const hasUnread = notifications.length > 0;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div 
          ref={popupRef}
          className="absolute bottom-16 right-0 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden flex flex-col"
          style={{ maxHeight: '400px' }}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Notifications</h3>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2">
            {notifications.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-4">No notifications</p>
            ) : (
              <ul className="space-y-2">
                {notifications.map(notification => (
                  <li 
                    key={notification.id} 
                    className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-100 dark:border-gray-600 relative group"
                  >
                    <button 
                      onClick={(e) => handleDelete(notification.id, e)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete notification"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                    <h4 className="text-sm font-medium mb-1 pr-6 text-gray-800 dark:text-gray-200">{notification.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{notification.message}</p>
                    <span className="text-[10px] text-gray-400 mt-2 block">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 relative"
        aria-label="Toggle notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
        </svg>
        {hasUnread && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
        )}
      </button>
    </div>
  );
}
