# Supabase Backend Setup Guide

This guide will help you set up the Supabase backend for the Expense Tracker application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new or existing Supabase project

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - Name: Expense Tracker (or any name you prefer)
   - Database Password: Choose a strong password (save it!)
   - Region: Choose the closest region to your users
4. Wait for the project to be created (takes ~2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env` in your project root:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace the placeholder values:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase/schema.sql` from this project
3. Copy and paste the entire SQL script into the SQL Editor
4. Click **Run** to execute the script
5. Verify that all tables were created by checking **Table Editor**

## Step 5: Set Up Row-Level Security (RLS)

1. In the SQL Editor, open `supabase/rls-policies.sql`
2. Copy and paste the entire SQL script into the SQL Editor
3. Click **Run** to execute the script
4. All RLS policies should now be enabled

## Step 6: Set Up Storage Buckets

1. In the SQL Editor, open `supabase/storage-setup.sql`
2. Copy and paste the entire SQL script into the SQL Editor
3. Click **Run** to execute the script
4. Verify the bucket was created by going to **Storage** in the dashboard

## Step 7: Configure Google OAuth (Optional but Recommended)

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Click on **Google**
3. Enable the Google provider
4. You'll need Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth client ID**
   - Choose **Web application**
   - Add authorized redirect URIs:
     - `https://your-project-id.supabase.co/auth/v1/callback` (from Supabase dashboard)
   - Copy the **Client ID** and **Client Secret**
5. Paste the credentials into Supabase Google provider settings
6. Save the changes

## Step 8: Install Dependencies

Run the following command in your project root:

```bash
npm install
```

This will install the Supabase client library and all other dependencies.

## Step 9: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login page
3. Try to:
   - Register a new account
   - Log in with email/password
   - Log in with Google (if configured)
   - Add a transaction
   - Add a category
   - Add a card

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables" error**
   - Make sure `.env` file exists in the project root
   - Verify the variable names start with `VITE_`
   - Restart your development server after changing `.env`

2. **RLS Policy Errors**
   - Make sure you ran `rls-policies.sql` after `schema.sql`
   - Check that RLS is enabled on all tables in **Table Editor**

3. **Authentication not working**
   - Verify your API keys are correct
   - Check that email confirmation is disabled in Supabase (for testing):
     - Go to **Authentication** → **Settings**
     - Disable "Enable email confirmations" for development

4. **Storage upload errors**
   - Make sure you ran `storage-setup.sql`
   - Verify the `receipts` bucket exists in **Storage**
   - Check storage policies are correctly set

5. **Google OAuth redirect errors**
   - Verify the redirect URI in Google Cloud Console matches Supabase callback URL
   - Make sure the redirect URL in Supabase settings includes your app URL

## Database Tables Created

The following tables are created:
- `profiles` - User profile information
- `categories` - Income and expense categories
- `cards` - Credit/debit card information
- `transactions` - All financial transactions
- `credit_entries` - Credit lent to others
- `credit_history` - History of credit lent transactions
- `credit_received` - Credit received from others
- `credit_received_history` - History of credit received payments

## Security Features

- ✅ Row-Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ Secure authentication with Supabase Auth
- ✅ Google OAuth support
- ✅ Secure storage bucket policies

## Production Deployment

Before deploying to production:

1. Update your production Supabase project settings
2. Add production URLs to Google OAuth redirect URIs
3. Update `.env` with production Supabase credentials
4. Enable email confirmations in Supabase settings
5. Review and test all security policies
6. Set up proper backup strategies

## Support

If you encounter any issues:
1. Check the Supabase logs in the dashboard
2. Check browser console for errors
3. Verify all SQL scripts ran successfully
4. Ensure environment variables are set correctly

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Row-Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

