// Simple test script to verify Supabase connection
// Run this with: node test-supabase.js

import { createClient } from '@supabase/supabase-js';

// Use your actual values
const supabaseUrl = 'https://xclhndjglcnkcvibqqgv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6d3M1enJ1aGJnMDhmbHYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NzE2djkzNywiZXhwIjoxOTYyNzQyOTM3fQ.91GSpzje2_4cFX-13PPEtnzshnlawRmQKHd2xyim0Gk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can connect
    const { data, error } = await supabase.from('users').select('count').single();
    console.log('Connection test result:', { data, error });
    
    // Test 2: List all tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    console.log('Available tables:', tables?.map(t => t.table_name) || 'No tables found');
    console.log('Tables error:', tablesError);
    
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

testConnection();