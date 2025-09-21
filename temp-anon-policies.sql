-- TEMPORARY ANON POLICIES FOR INITIAL TESTING
-- Run this to enable anon access for testing the app before implementing proper auth
-- SECURITY WARNING: These are permissive policies for development/testing only

-- Allow anon to read all users (for profile browsing)
CREATE POLICY "Temp anon read users" ON public.users
  FOR SELECT TO anon
  USING (true);

-- Allow anon to update users (for profile updates without auth)
CREATE POLICY "Temp anon update users" ON public.users
  FOR UPDATE TO anon
  USING (true);

-- Allow anon to read all date posts
CREATE POLICY "Temp anon read posts" ON public.date_posts
  FOR SELECT TO anon
  USING (true);

-- Allow anon to create date posts
CREATE POLICY "Temp anon insert posts" ON public.date_posts
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anon to update date posts (for interest toggles, choosing applicants)
CREATE POLICY "Temp anon update posts" ON public.date_posts
  FOR UPDATE TO anon
  USING (true);

-- Allow anon to delete date posts
CREATE POLICY "Temp anon delete posts" ON public.date_posts
  FOR DELETE TO anon
  USING (true);

-- Allow anon to read all messages
CREATE POLICY "Temp anon read messages" ON public.messages
  FOR SELECT TO anon
  USING (true);

-- Allow anon to send messages
CREATE POLICY "Temp anon insert messages" ON public.messages
  FOR INSERT TO anon
  WITH CHECK (true);

-- Grant sequence usage to anon
GRANT USAGE ON SEQUENCE public.users_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.date_posts_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.messages_id_seq TO anon;

SELECT 'Temporary anon policies created - REMOVE THESE IN PRODUCTION!' as status;