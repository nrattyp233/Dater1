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

This app is configured to run on Netlify with NeonDB as the database. All backend logic, including Gemini AI calls, is handled by Netlify Functions to protect your API keys.

1) **Set up Neon Database:**
   - Go to https://neon.tech/ and create a new project.
   - Find your database connection string in the project dashboard.
   - Connect to your database using a SQL client (e.g., DBeaver, TablePlus, or `psql`).
   - Execute the entire script from `direct-db-setup.sql` to create and seed your tables.

2) **Set Environment Variables in Netlify:**
   In your Netlify site settings (under "Site configuration" > "Environment variables"), add the following:
   - `NEON_DATABASE_URL`: Your full Neon database connection string.
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
   - `PAYPAL_CLIENT_ID`: Your PayPal app client ID.
   - `PAYPAL_CLIENT_SECRET`: Your PayPal app client secret.
   - `REACT_APP_PAYPAL_CLIENT_ID`: Your PayPal app client ID (this is used by the frontend).

   **PayPal Setup:**
   - Create a PayPal developer account at https://developer.paypal.com/.
   - Create a new app in the PayPal developer dashboard to get your Client ID and Secret.
   - Use sandbox credentials for testing and live credentials for production.

3) **Deploy:**
   - Connect your GitHub repository to a new site in Netlify.
   - Netlify will automatically use the build command (`npm run build`) and publish directory (`dist`) from your `netlify.toml` file.
   - After a successful build, your site will be live!

4) **Local Development with Netlify CLI:**
   To run the full stack locally, including the Netlify functions:
   ```bash
   # Install dependencies
   npm install
   
   # Install Netlify CLI globally (if you haven't already)
   npm install -g netlify-cli
   
   # Run the development server
   netlify dev
   ```
   You will need to create a `.env` file in the root of your project and add your environment variables there for local development.

Note: The client communicates with the backend via a relative path (`/api/...`), which is redirected to the appropriate Netlify function. No API keys are exposed in the browser.
