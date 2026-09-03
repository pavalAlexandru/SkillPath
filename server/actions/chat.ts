'use server';

import { createClient } from '@/server/supabase/server';
import { revalidatePath } from 'next/cache';
import { censorText } from '@/lib/censor';

export type ChatMessage = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    email: string | null;
    avatarUrl?: string | null;
    level?: string | null;
    joinedAt: string;
  };
};

export async function getRecentMessages(limit = 50, searchKeyword?: string): Promise<ChatMessage[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('chat_messages')
    .select(`
      id,
      content,
      created_at,
      author:profiles!fk_chat_messages_author(
        id,
        first_name,
        last_name,
        role,
        avatar_url,
        email,
        created_at,
        student_profiles(current_level)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (searchKeyword && searchKeyword.trim() !== '') {
    query = query.ilike('content', `%${searchKeyword}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }

  return (data || []).map((msg: any) => ({
    id: msg.id,
    content: censorText(msg.content),
    createdAt: msg.created_at,
    author: {
      id: msg.author.id,
      firstName: msg.author.first_name,
      lastName: msg.author.last_name,
      role: msg.author.role,
      email: msg.author.email || null,
      avatarUrl: msg.author.avatar_url,
      level: msg.author.student_profiles?.current_level || null,
      joinedAt: msg.author.created_at,
    }
  }));
}

export async function sendMessage(content: string): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('chat_messages')
    .insert({
      content,
      author_id: user.id
    });

  if (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }

  revalidatePath('/forum');
}
