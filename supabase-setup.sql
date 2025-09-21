-- Supabase Database Setup for Dater1 App
-- Run this in your Supabase SQL Editor to create the required tables

-- Drop existing tables if they exist (in reverse order due to foreign keys)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS date_posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table first (no dependencies)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  bio TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  interests JSONB DEFAULT '[]'::jsonb,
  gender TEXT,
  is_premium BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}'::jsonb,
  earned_badge_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create date_posts table (depends on users)
CREATE TABLE date_posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  location TEXT,
  date_time TEXT,
  applicants JSONB DEFAULT '[]'::jsonb,
  chosen_applicant_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  categories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table (depends on users)
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table (depends on users)
CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paypal_order_id TEXT NOT NULL UNIQUE,
  paypal_capture_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add premium_activated_at column to users table
ALTER TABLE users ADD COLUMN premium_activated_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX idx_date_posts_created_by ON date_posts(created_by);
CREATE INDEX idx_date_posts_created_at ON date_posts(created_at DESC);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_paypal_order_id ON payments(paypal_order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Disable RLS for now (enable later for production)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE date_posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Insert some test data to verify everything works
INSERT INTO users (id, name, age, bio, photos, interests, gender, is_premium, preferences, earned_badge_ids) VALUES 
(1, 'Test User', 25, 'Just testing the database', '[]', '["Testing"]', 'other', false, '{}', '[]');

-- Verify the tables were created correctly
SELECT 'Users table created' as status, COUNT(*) as count FROM users;
SELECT 'Date_posts table created' as status FROM date_posts LIMIT 0;
SELECT 'Messages table created' as status FROM messages LIMIT 0;