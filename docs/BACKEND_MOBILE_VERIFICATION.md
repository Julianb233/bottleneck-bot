# Backend Mobile & Web Verification Guide

This document describes how to verify that all backend functionality works correctly on both web and mobile platforms.

## Overview

The backend has been configured with comprehensive CORS support to ensure all API endpoints are accessible from:
- Desktop browsers (Chrome, Safari, Firefox, Edge)
- Mobile browsers (iOS Safari, Android Chrome, iPad Safari)
- Native mobile apps (via API calls)

## CORS Configuration

### Shared CORS Middleware

All endpoints use a shared CORS middleware located at `server/_core/cors.ts` that:
- Allows cross-origin requests from any origin (configurable per environment)
- Supports credentials (cookies, authorization headers)
- Handles preflight OPTIONS requests
- Includes mobile-specific headers
- Caches preflight requests for 24 hours (improves mobile performance)

### Endpoints Covered

The CORS middleware is applied to all API endpoints:
- ✅ `/api/health` - Health check endpoint
- ✅ `/api/v1/*` - REST API v1 endpoints
- ✅ `/api/trpc/*` - tRPC endpoints
- ✅ `/api/auth/*` - Authentication endpoints
- ✅ `/api/webhooks/*` - Webhook endpoints
- ✅ `/api/onboarding/*` - Onboarding endpoints
- ✅ `/api/oauth/*` - OAuth callback endpoints

## Verification Script

### Running the Verification Script

```bash
# Test against local development server
pnpm verify:backend

# Test against production (set BASE_URL environment variable)
BASE_URL=https://your-production-url.com pnpm verify:backend
```

### What the Script Tests

The verification script (`scripts/verify-backend-mobile.ts`) tests:

1. **Multiple User Agents:**
   - Desktop Chrome
   - Desktop Safari
   - iPhone Safari
   - Android Chrome
   - iPad Safari

2. **All API Endpoints:**
   - Health endpoints
   - Authentication endpoints
   - tRPC endpoints
   - REST API endpoints
   - Webhook endpoints
   - OPTIONS preflight requests

3. **CORS Headers:**
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Methods`
   - `Access-Control-Allow-Headers`
   - `Access-Control-Allow-Credentials`
   - `Access-Control-Max-Age`

4. **Performance Metrics:**
   - Response times
   - Success rates
   - Error rates

### Expected Results

✅ **All tests should pass** with:
- Status codes < 500 (4xx is expected without authentication)
- CORS headers present on all responses
- Response times < 2 seconds
- No CORS errors in console

## Manual Testing

### Testing from Mobile Browser

1. **Open mobile browser** (Safari on iOS or Chrome on Android)
2. **Navigate to your app URL**
3. **Open Developer Tools** (if available) or use remote debugging
4. **Check Network tab** for:
   - No CORS errors
   - Proper CORS headers on responses
   - Successful API calls

### Testing from Desktop Browser

1. **Open browser DevTools** (F12)
2. **Go to Network tab**
3. **Enable "Disable cache"**
4. **Navigate to your app**
5. **Check for:**
   - No CORS errors in console
   - All API requests succeed
   - CORS headers present

### Testing with curl

```bash
# Test OPTIONS preflight request
curl -X OPTIONS https://your-domain.com/api/health \
  -H "Origin: https://your-domain.com" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Should return:
# < HTTP/1.1 204 No Content
# < Access-Control-Allow-Origin: https://your-domain.com
# < Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
# < Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-ID, ...
```

## Common Issues

### Issue: CORS errors in mobile browser

**Symptoms:**
- `Access to fetch at '...' from origin '...' has been blocked by CORS policy`
- API calls fail on mobile but work on desktop

**Solution:**
1. Verify CORS middleware is applied to main Express app
2. Check that `server/_core/index.ts` includes `app.use(corsMiddleware)`
3. Ensure CORS middleware is before other middleware
4. Run verification script to identify specific endpoints

### Issue: Preflight requests failing

**Symptoms:**
- OPTIONS requests return 404 or 405
- CORS errors only on POST/PUT/DELETE requests

**Solution:**
1. Verify OPTIONS method is handled in CORS middleware
2. Check that CORS middleware returns 204 for OPTIONS requests
3. Ensure CORS middleware is before route handlers

### Issue: Credentials not working

**Symptoms:**
- Cookies not sent with requests
- Authorization headers not working

**Solution:**
1. Verify `Access-Control-Allow-Credentials: true` header is set
2. Check that `Access-Control-Allow-Origin` is not `*` when using credentials
3. Update CORS middleware to use specific origin instead of `*` if needed

## Production Checklist

Before deploying to production, verify:

- [ ] CORS middleware is enabled on all endpoints
- [ ] Verification script passes for all user agents
- [ ] No CORS errors in browser console
- [ ] Mobile browsers can access all API endpoints
- [ ] Preflight requests return 204 with proper headers
- [ ] Credentials work correctly (if using cookies/auth headers)
- [ ] Response times are acceptable (< 2 seconds)

## Environment-Specific Configuration

### Development

CORS allows all origins (`*`) for easier development.

### Production

Consider restricting CORS to specific origins:

```typescript
// In server/_core/cors.ts
const allowedOrigins = [
  'https://your-domain.com',
  'https://www.your-domain.com',
  'https://app.your-domain.com',
];

const origin = req.headers.origin;
if (allowedOrigins.includes(origin || '')) {
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
} else {
  res.setHeader("Access-Control-Allow-Origin", "null");
}
```

## Additional Resources

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Playwright Mobile Testing](https://playwright.dev/docs/emulation#mobile)
- [Express CORS Guide](https://expressjs.com/en/resources/middleware/cors.html)

