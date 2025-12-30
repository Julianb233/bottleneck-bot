# Authentication Fixes Summary

## Issues Identified and Fixed

### 1. Google OAuth Cookie Setting Issue ✅ FIXED

**Problem:**
- Google OAuth callback was redirecting to `/auth/callback?sessionToken=...` with the token in the URL
- Client-side code was trying to set the cookie manually, but cookies need to be `httpOnly` (set server-side only)
- This caused authentication to fail because the cookie wasn't being set properly

**Solution:**
- Modified `server/_core/google-auth.ts` to set the cookie server-side before redirecting
- Added a server-side `/auth/callback` route handler for backward compatibility
- Removed client-side cookie setting code from `client/src/App.tsx`

**Files Changed:**
- `server/_core/google-auth.ts` - Now sets cookie server-side and redirects appropriately
- `client/src/App.tsx` - Removed manual cookie setting, now just refetches user data

### 2. Email/Password Authentication ✅ WORKING

**Status:** Email/password authentication was already working correctly. The server sets cookies properly and the frontend handles redirects.

**Files:**
- `server/_core/email-auth.ts` - Handles login/signup and sets cookies correctly
- `client/src/hooks/useAuth.ts` - Handles redirects after successful login

## Important Notes

### About "Clerk" OAuth

The codebase does **not** use Clerk. It uses:
1. **Google OAuth 2.0** - For Google sign-in
2. **Email/Password** - For traditional authentication
3. **Manus OAuth** (optional) - A custom OAuth server if `OAUTH_SERVER_URL` is configured

If you mentioned Clerk, you might be thinking of a different project or there may be a configuration mismatch.

## Required Environment Variables

Make sure these are set in your production environment:

```bash
# Required for all authentication
JWT_SECRET=your-secure-random-string-32-chars-minimum
DATABASE_URL=your-postgres-connection-string

# Required for Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/oauth/google/callback

# Optional (for Manus OAuth)
OAUTH_SERVER_URL=https://your-manus-oauth-server.com
VITE_APP_ID=your-app-id
```

## Testing Authentication

### Test Email/Password Login

1. Navigate to `/login`
2. Enter email and password
3. Check browser DevTools > Application > Cookies
4. Verify `app_session_id` cookie is set
5. Should redirect to `/dashboard` or `/onboarding`

### Test Google OAuth

1. Navigate to `/login`
2. Click "Sign in with Google"
3. Complete Google OAuth flow
4. Check browser DevTools > Application > Cookies
5. Verify `app_session_id` cookie is set
6. Should redirect to `/dashboard` or `/onboarding`

### Debug OAuth Configuration

Visit `/api/oauth/google/config` to see:
- Whether `GOOGLE_CLIENT_ID` is set
- The configured redirect URI
- Whether `GOOGLE_CLIENT_SECRET` is set
- Database connection status

## Common Issues and Solutions

### Issue: "Invalid session cookie" or "User not found"

**Causes:**
1. `JWT_SECRET` not set or changed (invalidates all existing sessions)
2. Cookie not being set (check browser DevTools)
3. Cookie domain/path mismatch
4. Database connection issues

**Solutions:**
1. Verify `JWT_SECRET` is set and hasn't changed
2. Check browser console for errors
3. Verify cookies are enabled in browser
4. Check server logs for database errors

### Issue: Google OAuth redirects but doesn't log in

**Causes:**
1. `GOOGLE_REDIRECT_URI` doesn't match Google Console settings
2. Cookie not being set (httpOnly cookies can't be set client-side)
3. Session token creation failing

**Solutions:**
1. Verify redirect URI matches exactly in Google Console
2. Check server logs for cookie setting errors
3. Verify `JWT_SECRET` is set correctly

### Issue: Email login works but OAuth doesn't (or vice versa)

**Causes:**
1. Different code paths for email vs OAuth
2. OAuth-specific configuration missing
3. Database user lookup failing for OAuth users

**Solutions:**
1. Check server logs for specific error messages
2. Verify OAuth environment variables are set
3. Check database for user records (may need to create user first)

## Diagnostic Tool

Run the diagnostic script to check your configuration:

```bash
tsx scripts/diagnose-auth.ts
```

This will check:
- Environment variables
- Database connectivity
- OAuth configuration
- JWT secret
- Cookie settings

## Next Steps

1. **Verify Environment Variables** - Ensure all required variables are set in production
2. **Test Both Auth Methods** - Test email/password and Google OAuth
3. **Check Server Logs** - Look for authentication errors in production logs
4. **Verify Cookies** - Use browser DevTools to verify cookies are being set correctly
5. **Test Redirects** - Ensure users are redirected to `/dashboard` or `/onboarding` after login

## Cookie Configuration

Cookies are configured in `server/_core/cookies.ts`:
- **Development:** `secure: false`, `sameSite: 'lax'`
- **Production:** `secure: true`, `sameSite: 'none'` (requires HTTPS)

The cookie name is `app_session_id` (defined in `shared/const.ts`).

## Session Token Format

Session tokens are JWTs containing:
- `openId` - User identifier (email_123, googleId, or Manus openId)
- `appId` - Application identifier ("google-oauth" for Google, or app ID for Manus)
- `name` - User's display name

Tokens are signed with `JWT_SECRET` and expire after 1 year.

