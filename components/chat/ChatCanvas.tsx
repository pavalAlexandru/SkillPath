'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { sendMessage, ChatMessage, getRecentMessages } from '@/server/actions/chat';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/server/supabase/client';
import Image from 'next/image';

function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <>{text}</>;
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 dark:text-white rounded-sm px-1 py-0.5 font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function ChatCanvas({
  initialMessages,
  currentUserId,
  currentUserProfile,
  searchKeyword
}: {
  initialMessages: ChatMessage[];
  currentUserId: string;
  currentUserProfile: any;
  searchKeyword: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [searchInput, setSearchInput] = useState(searchKeyword);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const channel = supabase
      .channel('chat_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          console.log('Realtime event received!', payload);
          // router.refresh() tells Next.js to re-fetch the Server Component (page.tsx)
          // which will pass the absolute newest messages down to this component
          router.refresh();
        }
      )
      .subscribe((status, err) => {
        console.log('Supabase subscription status:', status);
        if (err) console.error('Supabase subscription error:', err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/forum?search=${encodeURIComponent(searchInput)}`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const optimisticMessage: ChatMessage = {
      id: Math.random().toString(),
      content: inputText,
      createdAt: new Date().toISOString(),
      author: {
        id: currentUserId,
        firstName: currentUserProfile?.first_name || 'You',
        lastName: currentUserProfile?.last_name || '',
        role: currentUserProfile?.role || 'STUDENT',
        avatarUrl: currentUserProfile?.avatar_url
      }
    };

    setMessages((prev) => [optimisticMessage, ...prev]);
    setInputText('');

    try {
      await sendMessage(optimisticMessage.content);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-sans text-sm">
      {/* Forum Header / Breadcrumbs & Search */}
      <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-sm shadow-sm">
        <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
          Forum Index &raquo; <span className="font-normal text-slate-500">General Discussion</span>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search thread..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="px-2 py-1 border border-slate-300 rounded-sm focus:outline-none focus:border-[#1d3c78] text-xs dark:bg-slate-800 dark:border-slate-700 w-40"
          />
          <button 
            type="submit"
            className="px-2 py-1 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-sm text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Search
          </button>
          {searchInput && (
            <button 
              type="button"
              onClick={() => {
                setSearchInput('');
                router.push('/forum');
              }}
              className="px-2 py-1 text-xs text-red-600 hover:underline"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Forum Thread */}
      <div className="flex flex-col-reverse gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {messages.map((msg, index) => {
          const isMentor = msg.author.role === 'MENTOR';
          return (
            <div key={msg.id} className="flex flex-col sm:flex-row border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm rounded-sm">
              {/* Left Column: Profile Box - Smaller and compact */}
              <div className="bg-slate-50 dark:bg-slate-950/50 w-full sm:w-36 p-3 border-b sm:border-b-0 sm:border-r border-slate-300 dark:border-slate-700 flex flex-col items-center shrink-0">
                {msg.author.avatarUrl ? (
                  <img 
                    src={msg.author.avatarUrl} 
                    alt={`${msg.author.firstName}'s avatar`}
                    className="w-14 h-14 object-cover rounded shadow-sm border border-slate-300 dark:border-slate-700 mb-2 bg-white"
                  />
                ) : (
                  <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded flex items-center justify-center text-xl text-slate-500 font-bold mb-2 border border-slate-300 dark:border-slate-700 shadow-inner">
                    {msg.author.firstName.charAt(0)}
                  </div>
                )}
                
                <div className={`font-bold text-center break-words w-full text-sm ${isMentor ? 'text-[#1d3c78] dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {msg.author.firstName} {msg.author.lastName}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase font-bold">
                  {isMentor ? 'Mentor' : 'Student'}
                </div>
              </div>
              
              {/* Right Column: Content */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="border-b border-slate-200 dark:border-slate-800 px-3 py-1.5 text-[11px] text-slate-500 bg-slate-50/50 dark:bg-slate-900/80 flex justify-between items-center">
                  <span title={new Date(msg.createdAt).toLocaleString()}>
                    Posted: {new Date(msg.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                  <span className="font-semibold text-slate-400">#{msg.id.substring(0, 6)}</span>
                </div>
                
                {/* Body */}
                <div className="p-4 text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap break-words min-h-[80px]">
                  <HighlightText text={msg.content} highlight={searchKeyword} />
                </div>
              </div>
            </div>
          );
        })}
        
        {messages.length === 0 && (
          <div className="p-8 text-center text-slate-500 border border-dashed border-slate-300 rounded-sm bg-white dark:bg-slate-900">
            No posts found in this thread yet.
          </div>
        )}
      </div>

      {/* Quick Reply Box */}
      <div className="mt-4">
        <form onSubmit={handleSendMessage} className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-3 rounded-sm shadow-sm">
          <div className="font-bold text-xs mb-2 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2">
            Quick Reply
          </div>
          <textarea
            rows={3}
            placeholder="Type your reply here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full px-2 py-1.5 mt-2 border border-slate-300 dark:border-slate-600 rounded-sm focus:outline-none focus:border-[#1d3c78] focus:ring-1 focus:ring-[#1d3c78] dark:bg-slate-900 text-sm resize-y"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-1.5 bg-[#1d3c78] text-white font-semibold text-xs rounded-sm shadow-sm hover:bg-[#152b57] disabled:opacity-50 disabled:shadow-none transition-all"
            >
              Post Reply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
