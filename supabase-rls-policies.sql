-- Row Level Security Policies for Create-A-Date Production
-- Run this AFTER creating tables with direct-db-setup.sql

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Allow public read access to user profiles (for browsing/matching)
CREATE POLICY "Public read users" ON public.users
  FOR SELECT TO anon, authenticated
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id::text);

-- Allow system to insert/update users (for initial setup and premium updates)
CREATE POLICY "System can manage users" ON public.users
  FOR ALL TO service_role
  USING (true);

-- Date posts table policies
-- Allow public read access to all date posts
CREATE POLICY "Public read date posts" ON public.date_posts
  FOR SELECT TO anon, authenticated
  USING (true);

-- Allow authenticated users to create date posts
CREATE POLICY "Authenticated users can create dates" ON public.date_posts
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow users to update their own date posts
CREATE POLICY "Users can update own dates" ON public.date_posts
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid()::integer);

-- Allow users to delete their own date posts
CREATE POLICY "Users can delete own dates" ON public.date_posts
  FOR DELETE TO authenticated
  USING (created_by = auth.uid()::integer);

-- Allow system full access for admin operations
CREATE POLICY "System can manage date posts" ON public.date_posts
  FOR ALL TO service_role
  USING (true);

-- Messages table policies
-- Allow users to read messages they sent or received
CREATE POLICY "Users can read own messages" ON public.messages
  FOR SELECT TO authenticated
  USING (sender_id = auth.uid()::integer OR receiver_id = auth.uid()::integer);

-- Allow authenticated users to send messages
CREATE POLICY "Authenticated users can send messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid()::integer);

-- Allow system full access for admin operations
CREATE POLICY "System can manage messages" ON public.messages
  FOR ALL TO service_role
  USING (true);

-- Payments table policies
-- Allow users to read their own payment history
CREATE POLICY "Users can read own payments" ON public.payments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()::integer);

-- Only system can create/update payment records (security)
CREATE POLICY "System can manage payments" ON public.payments
  FOR ALL TO service_role
  USING (true);

-- TEMPORARY: Allow anon access for initial testing (REMOVE in production)
-- Uncomment these if you need to test without authentication first
/*
CREATE POLICY "Temp anon read users" ON public.users
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Temp anon read posts" ON public.date_posts
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Temp anon read messages" ON public.messages
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Temp anon insert posts" ON public.date_posts
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Temp anon update posts" ON public.date_posts
  FOR UPDATE TO anon
  USING (true);

CREATE POLICY "Temp anon insert messages" ON public.messages
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Temp anon update users" ON public.users
  FOR UPDATE TO anon
  USING (true);
*/

-- Grant usage on sequences to authenticated users
GRANT USAGE ON SEQUENCE public.users_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.date_posts_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.messages_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.payments_id_seq TO authenticated;

SELECT 'RLS policies created successfully!' as status;