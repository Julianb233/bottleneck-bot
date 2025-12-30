# Environment Variables Setup Guide

## ✅ Database Configuration - COMPLETE

Your Neon database credentials have been added to `.env`:

```bash
DATABASE_URL=postgresql://neondb_owner:npg_BDuynUv93aHd@ep-frosty-butterfly-ahz6v6bh-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## ⚠️ Required: Google OAuth Configuration

To enable Google Sign-In, you need to:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/apis/credentials

2. **Create OAuth 2.0 Credentials** (if you haven't already):
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/oauth/google/callback` (for development)
     - `https://yourdomain.com/api/oauth/google/callback` (for production)

3. **Add to `.env` file**:
   ```bash
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/oauth/google/callback
   ```

## ✅ JWT Secret - GENERATED

A secure JWT secret has been generated and added to your `.env` file:
- **Length**: 64 characters (hex)
- **Security**: Cryptographically secure random string

## Current `.env` Status

Your `.env` file now contains:

✅ **DATABASE_URL** - Neon database connection  
✅ **JWT_SECRET** - Secure random string for session tokens  
❌ **GOOGLE_CLIENT_ID** - **NEEDS TO BE ADDED**  
❌ **GOOGLE_CLIENT_SECRET** - **NEEDS TO BE ADDED**  
✅ **GOOGLE_REDIRECT_URI** - Set to localhost (update for production)

## Testing Your Setup

### 1. Test Database Connection

```bash
tsx scripts/diagnose-auth.ts
```

This will check:
- Database connectivity
- Environment variables
- OAuth configuration
- JWT secret

### 2. Test Email/Password Authentication

Once your database is connected, you can:
1. Start the server: `pnpm dev`
2. Navigate to `/login`
3. Create an account or log in with email/password

### 3. Test Google OAuth (After Adding Credentials)

1. Add your Google OAuth credentials to `.env`
2. Restart the server
3. Navigate to `/login`
4. Click "Sign in with Google"
5. Complete the OAuth flow

## Production Setup

For production deployment (e.g., Vercel):

1. **Set Environment Variables** in your hosting platform:
   ```bash
   DATABASE_URL=your-production-database-url
   JWT_SECRET=your-production-jwt-secret
   GOOGLE_CLIENT_ID=your-production-client-id
   GOOGLE_CLIENT_SECRET=your-production-client-secret
   GOOGLE_REDIRECT_URI=https://yourdomain.com/api/oauth/google/callback
   NODE_ENV=production
   ```

2. **Update Google Console**:
   - Add your production redirect URI to authorized redirect URIs
   - Make sure it matches exactly (including https://)

3. **Verify Configuration**:
   - Visit `/api/oauth/google/config` to verify OAuth setup
   - Check server logs for any connection errors

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. **Check DATABASE_URL**:
   ```bash
   echo $DATABASE_URL
   ```

2. **Test connection manually**:
   ```bash
   psql "$DATABASE_URL" -c "SELECT 1;"
   ```

3. **Check SSL mode**: Make sure `?sslmode=require` is in your connection string

### OAuth Issues

If Google OAuth doesn't work:

1. **Verify redirect URI matches exactly**:
   - Check Google Console authorized redirect URIs
   - Must match exactly (including http:// vs https://, trailing slashes, etc.)

2. **Check OAuth config endpoint**:
   ```bash
   curl http://localhost:3000/api/oauth/google/config
   ```

3. **Check server logs** for detailed error messages

### Session/Cookie Issues

If login works but you get logged out immediately:

1. **Check JWT_SECRET** is set and hasn't changed
2. **Check browser cookies**:
   - Open DevTools > Application > Cookies
   - Look for `app_session_id` cookie
   - Verify it's being set (not blocked)

3. **Check cookie settings**:
   - In development: `secure: false`, `sameSite: 'lax'`
   - In production: `secure: true`, `sameSite: 'none'` (requires HTTPS)

## Security Notes

⚠️ **Important**:
- Never commit `.env` to git (it's already in `.gitignore`)
- Use different JWT_SECRET for production
- Use different Google OAuth credentials for production
- Keep your database credentials secure
- Rotate secrets if they're ever exposed

## Next Steps

1. ✅ Database credentials added
2. ✅ JWT secret generated
3. ⏳ Add Google OAuth credentials (see above)
4. ⏳ Test authentication flows
5. ⏳ Deploy to production with production credentials

## Quick Reference

**Check your configuration:**
```bash
tsx scripts/diagnose-auth.ts
```

**Start development server:**
```bash
pnpm dev
```

**Test OAuth config:**
```bash
curl http://localhost:3000/api/oauth/google/config
```

**View environment variables:**
```bash
cat .env
```



