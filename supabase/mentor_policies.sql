-- Mentor policies for questions table
CREATE POLICY "Mentors can update questions"
ON public.questions
FOR UPDATE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'MENTOR'
);

CREATE POLICY "Mentors can delete questions"
ON public.questions
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'MENTOR'
);

-- Mentor policies for question_options table
CREATE POLICY "Mentors can update question_options"
ON public.question_options
FOR UPDATE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'MENTOR'
);

CREATE POLICY "Mentors can delete question_options"
ON public.question_options
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'MENTOR'
);
