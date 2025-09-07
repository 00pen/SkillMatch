# Vercel Deployment Guide for SkillMatch

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/skillmatch)

## Manual Deployment Steps

### 1. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/log in
2. Click "New Project"
3. Import your Git repository (GitHub, GitLab, or Bitbucket)

### 2. Configure Environment Variables
In your Vercel project settings, add these environment variables:

**Required Environment Variables:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### 3. Build Settings
Vercel will automatically detect the settings, but verify:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Install Command:** `npm install`

### 4. Deploy
Click "Deploy" and Vercel will build and deploy your application.

## Configuration Files

The project includes:
- `vercel.json` - Vercel deployment configuration
- `.vercelignore` - Files to exclude from deployment

## Build Process

The application will:
1. Install dependencies with `npm install`
2. Build the React app with `npm run build`
3. Deploy static files to Vercel's CDN

## Domain Configuration

After deployment:
1. Your app will be available at `https://your-project.vercel.app`
2. You can add a custom domain in Vercel project settings
3. All routes will properly redirect to the React SPA

## Environment Variables Security

- Never commit `.env` files to your repository
- All environment variables are securely managed by Vercel
- Production values override any local environment files

## Troubleshooting

### Build Fails
- Check that all environment variables are set in Vercel
- Verify your Supabase credentials are correct
- Check the build logs in Vercel dashboard

### App Loads but API Fails
- Verify Supabase URL and key are correctly set
- Check Supabase project is active and accessible
- Ensure your Supabase database has the required schema