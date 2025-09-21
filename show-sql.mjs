import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🚀 Creating Supabase tables...');

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createTablesDirectly() {
  try {
    console.log('📋 The tables need to be created in Supabase dashboard.');
    console.log('🔗 Please visit: https://supabase.com/dashboard/project/xclhndjglcnkcvibqqgv/sql');
    console.log('');
    console.log('📝 Copy and paste this SQL script:');
    console.log('---------------------------------------------------');
    
    const sqlScript = `-- Create users table
CREATE TABLE IF NOT EXISTS users (
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
  premium_activated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create date_posts table
CREATE TABLE IF NOT EXISTS date_posts (
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

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paypal_order_id TEXT NOT NULL UNIQUE,
  paypal_capture_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_date_posts_created_by ON date_posts(created_by);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- Insert test data
INSERT INTO users (id, name, age, bio, photos, interests, gender, is_premium, preferences, earned_badge_ids) VALUES 
(1, 'Alex', 28, 'Software engineer by day, aspiring chef by night.', '["https://picsum.photos/seed/alex1/400/600"]', '["Cooking","Tech","Hiking"]', 'male', false, '{"interestedIn": ["female"], "ageRange": {"min": 24, "max": 32}}', '["starter"]'),
(2, 'Brenda', 25, 'Graphic designer with a love for all things art and nature.', '["https://picsum.photos/seed/brenda1/400/600"]', '["Art","Dogs","Photography"]', 'female', false, '{"interestedIn": ["male"], "ageRange": {"min": 25, "max": 35}}', '["first_date"]')
ON CONFLICT (id) DO NOTHING;

-- Verify tables
SELECT 'Setup completed!' as status;`;

    console.log(sqlScript);
    console.log('---------------------------------------------------');
    console.log('');
    console.log('📌 After running the SQL:');
    console.log('1. Refresh your app at http://localhost:8888');
    console.log('2. The "could not load current user data" error should be fixed');
    console.log('3. You should see the test users in the app');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTablesDirectly();