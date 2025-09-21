# Create-A-Date Production Setup Guide

## Quick Start (Get the app working NOW)

### Step 1: Create Database Tables
1. Open [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → SQL Editor
2. Copy and paste the contents of `direct-db-setup.sql` 
3. Click "Run" - this creates all tables and seeds initial users/date posts

### Step 2: Enable Data Access
1. In the same SQL Editor, copy and paste the contents of `temp-anon-policies.sql`
2. Click "Run" - this allows the app to read/write data without authentication
3. **SECURITY NOTE**: These are temporary permissive policies for testing. Replace with proper auth later.

### Step 3: Verify It Works
1. Visit https://create-a-date.netlify.app
2. You should see user profiles loading (no more "No users available" message)
3. Test the core flows:
   - Swipe through profiles
   - Create a date post
   - Toggle interest on existing dates
   - Send messages between users

## What's Live in Production

✅ **Frontend**: React app with hardened error handling
✅ **Backend**: Netlify Functions for data operations  
✅ **Database**: Supabase PostgreSQL schema ready
✅ **Payments**: PayPal integration with server-side verification
✅ **Resilience**: Browser fallback if functions can't reach DB

## Security Model (Current vs Target)

### Current (Testing Mode)
- Anonymous users can read/write all data
- No authentication required
- Permissive policies for quick testing

### Target (Production Mode)
- Implement proper user authentication (Supabase Auth)
- Row Level Security policies per user
- Payments tied to authenticated user accounts
- See `supabase-rls-policies.sql` for proper policies

## Environment Variables Configured

### Netlify Production
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` (for functions)
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` (for payments)

### Frontend (Vite)
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (browser fallback)
- `VITE_DATA_API` (API endpoint override)

## Troubleshooting

### "No users available yet"
- Tables haven't been created → Run `direct-db-setup.sql`
- RLS blocking reads → Run `temp-anon-policies.sql`

### Function errors in logs
- Netlify Functions can't reach Supabase (network issue)
- Browser fallback should work regardless
- Check health endpoint: `POST /.netlify/functions/app {"action":"health"}`

### PayPal issues
- Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are production values
- Payment verification happens server-side before granting premium

## Next Steps for Production

1. **Implement Authentication**
   - Add Supabase Auth to frontend
   - Replace anon policies with user-scoped policies
   - Update API calls to use authenticated user context

2. **Tighten Security**
   - Remove temporary anon policies
   - Apply `supabase-rls-policies.sql` 
   - Add rate limiting and input validation

3. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor function performance
   - Database query optimization

## Quick Commands

```bash
# Check app health
curl -X POST https://create-a-date.netlify.app/.netlify/functions/app \
  -H "Content-Type: application/json" \
  -d '{"action":"health"}'

# Redeploy after changes
npm run build && netlify deploy --prod --dir=dist
```

## File Reference

- `direct-db-setup.sql` - Database schema + seed data
- `temp-anon-policies.sql` - Permissive policies for testing
- `supabase-rls-policies.sql` - Production-ready security policies
- `netlify.toml` - Build and environment configuration
- `services/api.ts` - Frontend API with fallback logic
- `netlify/functions/app.ts` - Backend data operations