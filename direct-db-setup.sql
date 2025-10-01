-- Production Database Setup for Create-A-Date
-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS date_posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
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
CREATE TABLE date_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by TEXT REFERENCES users(id) ON DELETE CASCADE,
  location TEXT,
  date_time TEXT,
  applicants JSONB DEFAULT '[]'::jsonb,
  chosen_applicant_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  categories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paypal_order_id TEXT NOT NULL UNIQUE,
  paypal_capture_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_date_posts_created_by ON date_posts(created_by);
CREATE INDEX idx_date_posts_created_at ON date_posts(created_at DESC);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_paypal_order_id ON payments(paypal_order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Insert initial production users
INSERT INTO users (id, name, age, bio, photos, interests, gender, is_premium, preferences, earned_badge_ids) VALUES 
('auth0|662a7e71a3962305dfb24f53', 'Alex Jordan', 28, 'Software engineer who loves building amazing apps. Always up for a coffee chat about tech or life!', '["https://picsum.photos/seed/alex1/400/600","https://picsum.photos/seed/alex2/400/600"]', '["Technology","Coffee","Fitness","Travel"]', 'male', false, '{"interestedIn": ["female"], "ageRange": {"min": 24, "max": 35}}', '[]'),
('auth0|662a7e71a3962305dfb24f54', 'Maya Chen', 26, 'UX designer passionate about creating beautiful experiences. Dog mom to a golden retriever named Pixel!', '["https://picsum.photos/seed/maya1/400/600","https://picsum.photos/seed/maya2/400/600"]', '["Design","Dogs","Art","Hiking"]', 'female', false, '{"interestedIn": ["male"], "ageRange": {"min": 25, "max": 32}}', '[]'),
('auth0|662a7e71a3962305dfb24f55', 'Jordan Rivera', 30, 'Entrepreneur building the next big thing. Love adventure sports and trying new cuisines!', '["https://picsum.photos/seed/jordan1/400/600","https://picsum.photos/seed/jordan2/400/600"]', '["Business","Adventure","Food","Networking"]', 'male', false, '{"interestedIn": ["female"], "ageRange": {"min": 26, "max": 34}}', '[]'),
('auth0|662a7e71a3962305dfb24f56', 'Sophia Kim', 27, 'Marketing manager by day, yoga instructor by evening. Always looking for the next great date idea!', '["https://picsum.photos/seed/sophia1/400/600","https://picsum.photos/seed/sophia2/400/600"]', '["Marketing","Yoga","Wellness","Music"]', 'female', false, '{"interestedIn": ["male"], "ageRange": {"min": 27, "max": 35}}', '[]'),
('auth0|662a7e71a3962305dfb24f57', 'Marcus Thompson', 29, 'Personal trainer who believes in living life to the fullest. Let''s explore the city together!', '["https://picsum.photos/seed/marcus1/400/600","https://picsum.photos/seed/marcus2/400/600"]', '["Fitness","Sports","Outdoors","Photography"]', 'male', false, '{"interestedIn": ["female"], "ageRange": {"min": 24, "max": 32}}', '[]');

-- Insert some initial date posts to get things started
INSERT INTO date_posts (id, title, description, created_by, location, date_time, applicants, chosen_applicant_id, categories) VALUES
('date_1', 'Coffee & Code Chat', 'Let''s grab coffee and talk about our favorite projects! Perfect for fellow tech enthusiasts.', 'auth0|662a7e71a3962305dfb24f53', 'Downtown Tech Cafe', '2024-12-30T15:00:00Z', '[]', null, '["Food & Drink"]'),
('date_2', 'Sunset Yoga Session', 'Join me for a relaxing yoga session at the park as the sun sets. All levels welcome!', 'auth0|662a7e71a3962305dfb24f56', 'Central Park Pavilion', '2024-12-28T17:30:00Z', '[]', null, '["Active & Fitness", "Relaxing & Casual"]'),
('date_3', 'Food Truck Adventure', 'Let''s explore the city''s best food trucks and try something new! Perfect for foodies.', 'auth0|662a7e71a3962305dfb24f55', 'Food Truck Plaza', '2024-12-29T12:00:00Z', '[]', null, '["Food & Drink", "Adventure"]');

SELECT 'Production database setup completed successfully!' as status;
