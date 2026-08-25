-- Enable RLS on the tables (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for public.profiles

-- Allow users to read all profiles (optional, but usually needed in apps)
DROP POLICY IF EXISTS "Allow public read on profiles" ON public.profiles;
CREATE POLICY "Allow public read on profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Allow users to insert their own profile during sign up
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);


-- Policies for public.student_profiles

-- Allow users to read all student profiles
DROP POLICY IF EXISTS "Allow public read on student_profiles" ON public.student_profiles;
CREATE POLICY "Allow public read on student_profiles"
ON public.student_profiles
FOR SELECT
USING (true);

-- Allow users to insert their own student profile during sign up
DROP POLICY IF EXISTS "Users can insert their own student profile" ON public.student_profiles;
CREATE POLICY "Users can insert their own student profile"
ON public.student_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own student profile
DROP POLICY IF EXISTS "Users can update their own student profile" ON public.student_profiles;
CREATE POLICY "Users can update their own student profile"
ON public.student_profiles
FOR UPDATE
USING (auth.uid() = user_id);
