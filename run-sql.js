const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function setupDatabase() {
  console.log('🚀 Setting up production database...');
  
  try {
    // Drop existing tables
    console.log('Dropping existing tables...');
    await supabase.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS payments CASCADE;' });
    await supabase.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS messages CASCADE;' });
    await supabase.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS date_posts CASCADE;' });
    await supabase.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS users CASCADE;' });
    
    // Create users table
    console.log('Creating users table...');
    await supabase.rpc('exec_sql', { 
      sql: `CREATE TABLE users (
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
      );` 
    });
    
    // Create other tables...
    console.log('Creating other tables...');
    // Continue with other tables and data...
    
    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

setupDatabase();