import { createClient } from '@supabase/supabase-js';

// Environment-based configuration with fallback
const isDevelopment = (import.meta as any).env.DEV;
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://xclhndjwlcnkcvibqogv.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbGhuZGp3bGNua2N2aWJxb2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzIwMjksImV4cCI6MjA3MzYwODAyOX0.91G5pzje2_4cFX-13PPEtnzshnlawRm0KMd2xyiw0Gk';

console.log('Supabase Configuration:', {
    url: supabaseUrl,
    environment: isDevelopment ? 'development' : 'production',
    hasAnonKey: !!supabaseAnonKey
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Test connection function
export const testSupabaseConnection = async () => {
    try {
        const { data, error } = await supabase.from('_health').select('*').limit(1);
        if (error && error.message.includes('Failed to fetch')) {
            throw new Error('Network error: Cannot connect to Supabase. The project might be paused or the URL might be incorrect.');
        }
        return { success: true, data };
    } catch (error: any) {
        console.error('Supabase connection test failed:', error);
        return { success: false, error: error.message };
    }
};

// Development mode warning
if (isDevelopment) {
    console.warn('🚨 Development Mode: Using Supabase configuration from environment variables');
    testSupabaseConnection().then(result => {
        if (!result.success) {
            console.error('❌ Supabase Connection Failed:', result.error);
            console.log('💡 Possible solutions:');
            console.log('1. Check if your Supabase project is active');
            console.log('2. Verify the VITE_SUPABASE_URL in your .env file');
            console.log('3. Check your internet connection');
        } else {
            console.log('✅ Supabase connection successful');
        }
    });
}
