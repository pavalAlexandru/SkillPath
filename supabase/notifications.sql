CREATE TABLE public.notifications (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['QUESTION_ACCEPTED', 'QUESTION_REJECTED', 'SYSTEM'])),
  reference_id bigint, -- Optional link to the question_id
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT fk_notifications_users FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Enable RLS and add policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id AND is_deleted = false);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);
