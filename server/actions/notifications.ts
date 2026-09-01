'use server';

import { createClient } from '@/server/supabase/server';

export async function notifyQuestionOutcome(
  questionId: number,
  status: 'APPROVED' | 'REJECTED'
): Promise<void> {
  const supabase = (await createClient()) as any;

  // 1. Fetch the question to get the creator's ID and question text
  const { data: question, error: questionError } = await supabase
    .from('questions')
    .select('created_by, question_text')
    .eq('id', questionId)
    .single();

  if (questionError || !question || !question.created_by) {
    console.error('Failed to fetch question for notification:', questionError);
    return;
  }

  // 2. Construct the notification details
  const title = status === 'APPROVED' ? 'Question Approved' : 'Question Rejected';
  
  // Truncate the question text for the message
  const truncatedText = question.question_text.length > 50 
    ? question.question_text.substring(0, 50) + '...'
    : question.question_text;
    
  const message = status === 'APPROVED' 
    ? `Your proposed question "${truncatedText}" has been approved by a mentor.`
    : `Your proposed question "${truncatedText}" was unfortunately rejected.`;
    
  const type = status === 'APPROVED' ? 'QUESTION_ACCEPTED' : 'QUESTION_REJECTED';

  // 3. Insert the notification
  const { error: insertError } = await supabase
    .from('notifications')
    .insert({
      user_id: question.created_by,
      title,
      message,
      type,
      reference_id: questionId,
    });

  if (insertError) {
    console.error('Failed to insert notification:', insertError);
  }
}

export async function getUserNotifications() {
  const supabase = (await createClient()) as any;
  
  const { data: userAuth, error: authError } = await supabase.auth.getUser();
  if (authError || !userAuth?.user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userAuth.user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }

  return data;
}

export async function deleteNotification(notificationId: number) {
  try {
    const supabase = (await createClient()) as any;

    const { data: userAuth, error: authError } = await supabase.auth.getUser();
    if (authError || !userAuth?.user) {
      console.error('deleteNotification: Not authenticated', authError);
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_deleted: true })
      .eq('id', notificationId)
      .eq('user_id', userAuth.user.id)
      .select();

    if (error) {
      console.error('Failed to delete notification:', error);
      return { success: false, error: error.message };
    }
    
    if (!data || data.length === 0) {
      console.error('Delete operation succeeded but no rows were updated. RLS issue or wrong ID? ID:', notificationId);
      return { success: false, error: 'No rows updated. You might be missing the RLS UPDATE policy.' };
    }
    
    return { success: true };
  } catch (e: any) {
    console.error('deleteNotification Exception:', e);
    return { success: false, error: e.message };
  }
}
