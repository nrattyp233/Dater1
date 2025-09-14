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

## Production Deploy (Vercel)

This app is configured to run production-only. Gemini calls are proxied via a Vercel Serverless Function to protect your API key.

1) Set environment variables in Vercel Project Settings → Environment Variables:
- `GEMINI_API_KEY` → your Google AI Studio key

2) Deploy
- Push to GitHub and import the repo in Vercel
- Vercel will serve static assets from `dist/` and the API from `api/`

3) Local production preview (optional)
```bash
npm ci
VITE_GEMINI_API_KEY=YOUR_KEY npm run build
npx vite preview --host 0.0.0.0 --port 4173
```

Note: Client uses `fetch('/api/ai')` for AI endpoints; no API key is exposed in the browser.
