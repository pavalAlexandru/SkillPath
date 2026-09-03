'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { sendMessage, ChatMessage, getRecentMessages } from '@/server/actions/chat';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/server/supabase/client';
import Image from 'next/image';
import { censorText } from '@/lib/censor';

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

function ProfileHoverBox({ author, isMentor }: { author: ChatMessage['author']; isMentor: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleScroll = () => setIsOpen(false);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      
      if (mobile) {
        setCoords({
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
        });
      } else {
        const cardHeight = 220; 
        let topPos = rect.top;
        if (topPos + cardHeight > window.innerHeight) {
          topPos = Math.max(10, window.innerHeight - cardHeight - 20);
        }
        setCoords({
          top: topPos,
          left: rect.right + 12
        });
      }
    }
    setIsOpen(true);
  };

  const portalContent = isOpen && typeof document !== 'undefined' ? createPortal(
    <div 
      className="fixed z-[9999] p-4 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-lg w-64 text-left animate-in fade-in zoom-in duration-200 cursor-default"
      style={{
        top: coords.top,
        left: coords.left,
        transform: isMobile ? 'translate(-50%, -50%)' : 'none'
      }}
      onMouseEnter={() => !isMobile && setIsOpen(true)}
      onMouseLeave={() => !isMobile && setIsOpen(false)}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3 mb-3 border-b border-slate-100 dark:border-slate-700 pb-3">
        {author.avatarUrl ? (
          <img src={author.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700" />
        ) : (
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-lg text-slate-500">
            {author.firstName.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{author.firstName} {author.lastName}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{isMentor ? 'Mentor' : 'Student'}</div>
        </div>
      </div>
      
      <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
        {author.email && (
          <div className="flex items-center gap-2" title={author.email}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-slate-400"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <span className="truncate text-xs">{author.email}</span>
          </div>
        )}
        {!isMentor && author.level && (
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-slate-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span className="font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md text-[10px] tracking-wider uppercase">{author.level}</span>
          </div>
        )}
        {!isMentor && !author.level && (
          <div className="text-xs text-slate-400 italic">Fără nivel</div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">
        Membru din {new Date(author.joinedAt).toLocaleDateString('ro-RO', { month: 'short', year: 'numeric' })}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div 
      ref={triggerRef}
      className="relative bg-slate-50 dark:bg-slate-950/50 w-full sm:w-36 p-3 border-b sm:border-b-0 sm:border-r border-slate-300 dark:border-slate-700 flex flex-col items-center shrink-0 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => {
        if (!isOpen) handleMouseEnter();
        else setIsOpen(false);
      }}
    >
      {author.avatarUrl ? (
        <img 
          src={author.avatarUrl} 
          alt={`${author.firstName}'s avatar`}
          className="w-14 h-14 object-cover rounded shadow-sm border border-slate-300 dark:border-slate-700 mb-2 bg-white"
        />
      ) : (
        <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded flex items-center justify-center text-xl text-slate-500 font-bold mb-2 border border-slate-300 dark:border-slate-700 shadow-inner">
          {author.firstName.charAt(0)}
        </div>
      )}
      
      <div className={`font-bold text-center break-words w-full text-sm ${isMentor ? 'text-[#1d3c78] dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
        {author.firstName} {author.lastName}
      </div>
      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase font-bold">
        {isMentor ? 'Mentor' : 'Student'}
      </div>

      {portalContent}
    </div>
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
      content: censorText(inputText),
      createdAt: new Date().toISOString(),
      author: {
        id: currentUserId,
        firstName: currentUserProfile?.first_name || 'You',
        lastName: currentUserProfile?.last_name || '',
        role: currentUserProfile?.role || 'STUDENT',
        avatarUrl: currentUserProfile?.avatar_url,
        email: currentUserProfile?.email || null,
        level: currentUserProfile?.student_profiles?.current_level || null,
        joinedAt: currentUserProfile?.created_at || new Date().toISOString()
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
          Index Forum &raquo; <span className="font-normal text-slate-500">Discuții Generale</span>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Caută în discuție..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="px-2 py-1 border border-slate-300 rounded-sm focus:outline-none focus:border-[#1d3c78] text-xs dark:bg-slate-800 dark:border-slate-700 w-40"
          />
          <button 
            type="submit"
            className="px-2 py-1 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-sm text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >Caută</button>
          {searchInput && (
            <button 
              type="button"
              onClick={() => {
                setSearchInput('');
                router.push('/forum');
              }}
              className="px-2 py-1 text-xs text-red-600 hover:underline"
            >Șterge</button>
          )}
        </form>
      </div>

      {/* Forum Thread */}
      <div className="flex flex-col-reverse gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {messages.map((msg, index) => {
          const isMentor = msg.author.role === 'MENTOR';
          return (
            <div key={msg.id} className="flex flex-col sm:flex-row border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm rounded-sm">
              <ProfileHoverBox author={msg.author} isMentor={isMentor} />
              
              {/* Right Column: Content */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="border-b border-slate-200 dark:border-slate-800 px-3 py-1.5 text-[11px] text-slate-500 bg-slate-50/50 dark:bg-slate-900/80 flex justify-between items-center">
                  <span title={new Date(msg.createdAt).toLocaleString()}>
                    Postat: {new Date(msg.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
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
            Nu a fost găsită nicio postare în această discuție.
          </div>
        )}
      </div>

      {/* Răspuns Rapid Box */}
      <div className="mt-4">
        <form onSubmit={handleSendMessage} className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-3 rounded-sm shadow-sm">
          <div className="font-bold text-xs mb-2 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2">
            Răspuns Rapid
          </div>
          <textarea
            rows={3}
            placeholder="Scrie răspunsul tău aici..."
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
              Postează Răspunsul
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
