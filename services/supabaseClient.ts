
// EDEN 11 MODIFICATION: BYPASSING EXTERNAL DEPENDENCY
// The original Supabase client setup has been neutralized to prevent runtime errors 
// regarding missing environment variables (VITE_SUPABASE_URL).
// The application is now running on a local mock data layer.

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
    signUp: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }), limit: () => ({ data: [], error: null }) }), or: () => ({ data: [], error: null }) }),
    insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
    update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
    delete: () => ({ eq: () => ({ error: null }) }),
  }),
  rpc: () => ({ data: null, error: null }),
} as any;
