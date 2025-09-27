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

// Development mode warning
if (isDevelopment) {
    console.warn('🚨 Development Mode: Using Supabase configuration from environment variables');
}
