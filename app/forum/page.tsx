import { getRecentMessages } from '@/server/actions/chat';
import ChatCanvas from '@/components/chat/ChatCanvas';
import { createClient } from '@/server/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Forum - Global Discussion',
};

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, role, avatar_url')
    .eq('id', user.id)
    .single();

  const currentParams = await searchParams;
  const searchKeyword = currentParams?.search || '';
  const initialMessages = await getRecentMessages(200, searchKeyword);

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Global Forum</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discuss with mentors and students
        </p>
      </div>
      
      <ChatCanvas 
        initialMessages={initialMessages} 
        currentUserId={user.id}
        currentUserProfile={profile}
        searchKeyword={searchKeyword}
      />
    </div>
  );
}
