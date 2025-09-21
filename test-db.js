import { createClient } from '@supabase/supabase-js';

// Test Supabase connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Database connection error:', error);
      console.log('This likely means the tables do not exist in Supabase.');
      console.log('You need to run the SQL script in supabase-setup.sql in your Supabase dashboard.');
    } else {
      console.log('Database connection successful!');
      console.log('User count:', data);
    }
  } catch (err) {
    console.error('Connection test failed:', err);
  }
}

testConnection();