-- Add the chat_messages table to the realtime publication
-- This allows the frontend to listen to INSERT, UPDATE, and DELETE events instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
