
import { createClient } from '@supabase/supabase-js';

// EDEN 11 UPGRADE: DYNAMIC CLIENT INJECTION
// Checks for environment variables to establish a REAL connection.
// If variables are missing, it defaults to the mock structure to prevent crashes.

// FIX: Cast import.meta to any to avoid TypeScript errors regarding 'env' property not existing on ImportMeta
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl && supabaseAnonKey;

if (!isConfigured) {
    console.warn("Supabase credentials not found. Running in MOCK mode.");
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      // MOCK CLIENT FOR FALLBACK
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
        signUp: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({ 
            eq: () => ({ 
                single: () => ({ data: null, error: null }), 
                limit: () => ({ data: [], error: null }),
                order: () => ({ data: [], error: null }) 
            }), 
            or: () => ({ 
                order: () => ({ data: [], error: null }) 
            }),
            order: () => ({ data: [], error: null }),
            insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) })
        }),
        insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
        delete: () => ({ eq: () => ({ error: null }) }),
      }),
      rpc: () => ({ data: null, error: null }),
    } as any;
