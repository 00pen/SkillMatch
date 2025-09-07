# OAuth Authentication Setup Guide for SkillMatch

This guide explains how to set up OAuth authentication with Google, LinkedIn, and GitHub for your SkillMatch application.

## Prerequisites

- Supabase project set up
- SkillMatch application running locally
- Access to Google Cloud Console, LinkedIn Developer Portal, and GitHub Developer Settings

## 1. Supabase Configuration

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**

### Step 2: Configure Site URL
1. In Authentication settings, set your **Site URL** to: `http://localhost:5173` (for development)
2. For production, use your actual domain: `https://yourdomain.com`

### Step 3: Add Redirect URLs
Add these redirect URLs in your Supabase Auth settings:
- Development: `http://localhost:5173/auth/callback`
- Production: `https://yourdomain.com/auth/callback`

## 2. Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google+ API** and **OAuth2 API**

### Step 2: Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Fill in required information:
   - App name: `SkillMatch`
   - User support email: Your email
   - Developer contact information: Your email

### Step 3: Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
5. Copy the **Client ID** and **Client Secret**

### Step 4: Configure in Supabase
1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Enter your **Client ID** and **Client Secret**
4. Save the configuration

## 3. LinkedIn OAuth Setup

### Step 1: Create LinkedIn App
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Click **Create App**
3. Fill in app details:
   - App name: `SkillMatch`
   - LinkedIn Page: Create or select a company page
   - App logo: Upload your logo
   - Legal agreement: Accept terms

### Step 2: Configure OAuth Settings
1. In your LinkedIn app, go to **Auth** tab
2. Add authorized redirect URLs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
3. Request **OpenID Connect** permissions:
   - `openid`
   - `profile`
   - `email`

### Step 3: Get Credentials
1. Copy the **Client ID** and **Client Secret** from the Auth tab

### Step 4: Configure in Supabase
1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **LinkedIn (OIDC)** provider
3. Enter your **Client ID** and **Client Secret**
4. Save the configuration

## 4. GitHub OAuth Setup

### Step 1: Create GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in application details:
   - Application name: `SkillMatch`
   - Homepage URL: `http://localhost:5173` (or your domain)
   - Authorization callback URL: `https://your-project-ref.supabase.co/auth/v1/callback`

### Step 2: Get Credentials
1. After creating the app, copy the **Client ID**
2. Generate a new **Client Secret** and copy it

### Step 3: Configure in Supabase
1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **GitHub** provider
3. Enter your **Client ID** and **Client Secret**
4. Save the configuration

## 5. Environment Variables

Ensure your `.env` file contains the Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 6. Testing OAuth Authentication

### Development Testing
1. Start your development server: `npm run dev`
2. Navigate to the login page: `http://localhost:5173/login`
3. Click on any OAuth provider button
4. Complete the OAuth flow
5. Verify you're redirected to the appropriate dashboard

### Production Testing
1. Deploy your application
2. Update OAuth app settings with production URLs
3. Test the complete flow in production environment

## 7. Troubleshooting

### Common Issues

**1. "Invalid redirect URI" error**
- Ensure redirect URIs match exactly in both OAuth provider and Supabase
- Check for trailing slashes and protocol (http vs https)

**2. "OAuth provider not configured" error**
- Verify the provider is enabled in Supabase
- Check that Client ID and Client Secret are correctly entered

**3. "User profile not created" error**
- Check database triggers are working
- Verify RLS policies allow profile creation
- Check browser console for detailed error messages

**4. LinkedIn OAuth issues**
- Ensure you're using LinkedIn (OIDC) provider, not the legacy LinkedIn provider
- Verify OpenID Connect permissions are granted

### Debug Steps
1. Check browser developer console for errors
2. Review Supabase Auth logs in dashboard
3. Verify network requests in browser dev tools
4. Test with different browsers/incognito mode

## 8. Security Considerations

1. **Never expose Client Secrets** in frontend code
2. **Use HTTPS** in production
3. **Validate redirect URIs** strictly
4. **Implement proper CSRF protection**
5. **Regularly rotate OAuth credentials**
6. **Monitor authentication logs** for suspicious activity

## 9. Production Deployment

When deploying to production:

1. Update OAuth app settings with production URLs
2. Update Supabase Site URL and redirect URLs
3. Ensure environment variables are set correctly
4. Test OAuth flow thoroughly in production environment
5. Monitor authentication metrics and error rates

## Support

If you encounter issues:
1. Check Supabase documentation: https://supabase.com/docs/guides/auth
2. Review OAuth provider documentation
3. Check GitHub issues for known problems
4. Contact support if needed

---

**Note**: This implementation includes automatic user profile creation with OAuth provider information and role assignment based on registration context.
