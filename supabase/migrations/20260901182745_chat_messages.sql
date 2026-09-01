CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  content text NOT NULL,
  author_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT fk_chat_messages_author FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Index for efficient chronological fetching
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Everyone can read messages
CREATE POLICY "Anyone can read chat messages" ON public.chat_messages
  FOR SELECT USING (true);

-- Authenticated users can insert their own messages
CREATE POLICY "Users can insert their own chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = author_id);
