import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🚀 Setting up Supabase database...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    // First, let's create the tables one by one
    console.log('📝 Creating users table...');
    
    // Create users table
    const createUsersSQL = `
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
    `;
    
    // Unfortunately, Supabase doesn't allow direct SQL execution via the client
    // Let's try a different approach - using the REST API directly
    
    console.log('🔧 Attempting to create tables via API...');
    
    // Test if tables exist by trying to insert data
    const testUsers = [
      { id: 1, name: 'Alex', age: 28, bio: 'Software engineer by day, aspiring chef by night.', photos: ['https://picsum.photos/400/600'], interests: ['Cooking','Tech'], gender: 'male', is_premium: false, preferences: { interestedIn: ['female'], ageRange: { min: 24, max: 32 } }, earned_badge_ids: ['starter'] },
      { id: 2, name: 'Brenda', age: 25, bio: 'Graphic designer with a love for all things art and nature.', photos: ['https://picsum.photos/400/600'], interests: ['Art','Dogs'], gender: 'female', is_premium: false, preferences: { interestedIn: ['male'], ageRange: { min: 25, max: 35 } }, earned_badge_ids: [] }
    ];
    
    console.log('👤 Inserting test users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert(testUsers, { onConflict: 'id' });
    
    if (userError) {
      console.error('❌ Users table error (may not exist):', userError.message);
      console.log('📋 You need to manually create the tables in Supabase dashboard using the SQL editor.');
      console.log('📁 Copy the contents of supabase-setup.sql and run it in: https://supabase.com/dashboard/project/xclhndjglcnkcvibqqgv/sql');
      return;
    } else {
      console.log('✅ Users table working!');
    }
    
    // Test date_posts table
    console.log('📅 Testing date_posts table...');
    const testDatePosts = [
      { 
        id: 1, 
        title: 'Coffee Date', 
        description: 'Let\'s grab coffee and chat!', 
        created_by: 1, 
        location: 'Downtown Coffee Shop', 
        date_time: '2024-12-25T14:00:00Z', 
        applicants: [], 
        chosen_applicant_id: null, 
        categories: ['Food & Drink'] 
      }
    ];
    
    const { data: dateData, error: dateError } = await supabase
      .from('date_posts')
      .upsert(testDatePosts, { onConflict: 'id' });
    
    if (dateError) {
      console.error('❌ Date posts table error:', dateError.message);
    } else {
      console.log('✅ Date posts table working!');
    }
    
    // Test messages table
    console.log('💬 Testing messages table...');
    const testMessages = [
      {
        id: 1,
        sender_id: 1,
        receiver_id: 2,
        text: 'Hey! How are you?',
        timestamp: new Date().toISOString(),
        read: false
      }
    ];
    
    const { data: msgData, error: msgError } = await supabase
      .from('messages')
      .upsert(testMessages, { onConflict: 'id' });
    
    if (msgError) {
      console.error('❌ Messages table error:', msgError.message);
    } else {
      console.log('✅ Messages table working!');
    }
    
    // Test payments table
    console.log('💳 Testing payments table...');
    const testPayments = [
      {
        id: 1,
        user_id: 1,
        paypal_order_id: 'test_order_123',
        amount: 10.00,
        status: 'completed'
      }
    ];
    
    const { data: payData, error: payError } = await supabase
      .from('payments')
      .upsert(testPayments, { onConflict: 'id' });
    
    if (payError) {
      console.error('❌ Payments table error:', payError.message);
    } else {
      console.log('✅ Payments table working!');
    }
    
    console.log('🎉 Database setup verification completed!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

createTables();