<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1gH2LdLDqrcGIgEOUAXHZm_kZp1J5pe8s

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Production Deploy (Netlify)

This app is configured to run on Netlify with Supabase as the database. Gemini calls are proxied via Netlify Functions to protect your API key.

1) **Set up Supabase database:**
   - Go to https://supabase.com/ and create a new project
   - In the SQL Editor, run the following to create your tables:
   ```sql
   -- Create users table
   CREATE TABLE users (
     id INTEGER PRIMARY KEY,
     name TEXT,
     age INTEGER,
     bio TEXT,
     photos JSONB,
     interests JSONB,
     gender TEXT,
     is_premium BOOLEAN,
     preferences JSONB,
     earned_badge_ids JSONB
   );

   -- Create date_posts table
   CREATE TABLE date_posts (
     id BIGSERIAL PRIMARY KEY,
     title TEXT,
     description TEXT,
     created_by INTEGER REFERENCES users(id),
     location TEXT,
     date_time TEXT,
     applicants JSONB,
     chosen_applicant_id INTEGER,
     categories JSONB
   );

   -- Create messages table
   CREATE TABLE messages (
     id BIGSERIAL PRIMARY KEY,
     sender_id INTEGER REFERENCES users(id),
     receiver_id INTEGER REFERENCES users(id),
     text TEXT,
     timestamp TEXT,
     read BOOLEAN
   );
   ```

2) **Set environment variables in Netlify Site Settings → Environment Variables:**
   - `SUPABASE_URL` → your Supabase project URL (found in Settings → API)
   - `SUPABASE_ANON_KEY` → your Supabase anon/public key (found in Settings → API)
   - `GEMINI_API_KEY` → your Google AI Studio key

3) **Deploy:**
   - Push to GitHub and connect your repo in Netlify
   - Netlify will serve static assets from `dist/` and the API from `netlify/functions/`
   - Make sure to set the build command to `npm run build` and publish directory to `dist`

4) **Local development with Netlify CLI:**
   ```bash
   npm install
   npm install -g netlify-cli
   netlify dev
   ```

Note: Client uses `fetch('/api/ai')` for AI endpoints; no API key is exposed in the browser.
