import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQLSetup() {
  try {
    console.log('🚀 Setting up Supabase database...');
    
    // Read the SQL file
    const sqlContent = readFileSync('./supabase-setup.sql', 'utf8');
    
    // Split SQL into individual statements (rough approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}...`);
          const { error } = await supabase.rpc('execute_sql', { sql_query: statement });
          
          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`❌ Failed to execute statement ${i + 1}:`, err);
        }
      }
    }
    
    console.log('🎉 Database setup completed!');
    
    // Test the setup by checking if tables exist
    console.log('🔍 Verifying table creation...');
    
    const { data: users, error: usersError } = await supabase.from('users').select('count', { count: 'exact', head: true });
    const { data: datePosts, error: datePostsError } = await supabase.from('date_posts').select('count', { count: 'exact', head: true });
    const { data: messages, error: messagesError } = await supabase.from('messages').select('count', { count: 'exact', head: true });
    const { data: payments, error: paymentsError } = await supabase.from('payments').select('count', { count: 'exact', head: true });
    
    if (!usersError) console.log('✅ Users table exists');
    if (!datePostsError) console.log('✅ Date posts table exists');
    if (!messagesError) console.log('✅ Messages table exists');
    if (!paymentsError) console.log('✅ Payments table exists');
    
    console.log('🎯 Database is ready for use!');
    
  } catch (error) {
    console.error('❌ Failed to setup database:', error);
  }
}

runSQLSetup();