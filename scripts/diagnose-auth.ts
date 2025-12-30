#!/usr/bin/env tsx
/**
 * Authentication Diagnostic Script
 * 
 * This script helps diagnose authentication issues by checking:
 * - Environment variables
 * - Database connectivity
 * - OAuth configuration
 * - Cookie settings
 */

import { ENV } from '../server/_core/env';
import { getDb } from '../server/db';
import { getUserByEmail, getUserByGoogleId, getUserByOpenId } from '../server/db';

async function checkEnvironmentVariables() {
  console.log('\n=== Environment Variables ===');
  
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ];

  const optional = [
    'GOOGLE_REDIRECT_URI',
    'OAUTH_SERVER_URL',
    'VITE_APP_ID',
  ];

  console.log('\nRequired Variables:');
  for (const key of required) {
    const value = process.env[key];
    const isSet = !!value;
    const displayValue = isSet ? (key === 'DATABASE_URL' || key === 'JWT_SECRET' 
      ? `${value.substring(0, 20)}...` 
      : value) : 'NOT SET';
    console.log(`  ${isSet ? '✓' : '✗'} ${key}: ${displayValue}`);
  }

  console.log('\nOptional Variables:');
  for (const key of optional) {
    const value = process.env[key];
    const isSet = !!value;
    console.log(`  ${isSet ? '✓' : '○'} ${key}: ${isSet ? value : 'NOT SET'}`);
  }
}

async function checkDatabase() {
  console.log('\n=== Database Connection ===');
  
  try {
    const db = await getDb();
    if (!db) {
      console.log('  ✗ Database connection failed - DATABASE_URL may be missing or invalid');
      return false;
    }

    // Test query
    await db.execute('SELECT 1');
    console.log('  ✓ Database connection successful');
    return true;
  } catch (error) {
    console.log('  ✗ Database connection failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function checkOAuthConfig() {
  console.log('\n=== OAuth Configuration ===');
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/oauth/google/callback';

  console.log(`  Client ID: ${clientId ? '✓ Set' : '✗ Missing'}`);
  console.log(`  Client Secret: ${clientSecret ? '✓ Set' : '✗ Missing'}`);
  console.log(`  Redirect URI: ${redirectUri}`);

  if (!clientId || !clientSecret) {
    console.log('\n  ⚠ OAuth is not fully configured. Google login will not work.');
  }
}

async function checkJWTSecret() {
  console.log('\n=== JWT Secret ===');
  
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    console.log('  ✗ JWT_SECRET is not set - session tokens cannot be created');
    console.log('  ⚠ This will cause authentication to fail!');
    return false;
  }

  if (secret.length < 32) {
    console.log(`  ⚠ JWT_SECRET is too short (${secret.length} chars) - should be at least 32 characters`);
    return false;
  }

  console.log(`  ✓ JWT_SECRET is set (${secret.length} characters)`);
  return true;
}

async function checkTestUser() {
  console.log('\n=== Test User Lookup ===');
  
  try {
    // Try to find a test user by email
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const userByEmail = await getUserByEmail(testEmail);
    
    if (userByEmail) {
      console.log(`  ✓ Found user by email: ${testEmail}`);
      console.log(`    - ID: ${userByEmail.id}`);
      console.log(`    - Name: ${userByEmail.name || 'N/A'}`);
      console.log(`    - Login Method: ${userByEmail.loginMethod || 'N/A'}`);
      console.log(`    - Has Password: ${!!userByEmail.password}`);
      console.log(`    - Has Google ID: ${!!userByEmail.googleId}`);
      console.log(`    - Has Open ID: ${!!userByEmail.openId}`);
    } else {
      console.log(`  ○ No user found with email: ${testEmail}`);
    }
  } catch (error) {
    console.log(`  ✗ Error checking test user: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function checkCookieConfig() {
  console.log('\n=== Cookie Configuration ===');
  
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1';
  
  console.log(`  Environment: ${isProduction ? 'Production' : 'Development'}`);
  console.log(`  Platform: ${isVercel ? 'Vercel' : 'Other'}`);
  
  console.log('\n  Expected Cookie Settings:');
  console.log('    - Name: app_session_id');
  console.log('    - httpOnly: true');
  console.log('    - secure: ' + (isProduction ? 'true (HTTPS required)' : 'false (HTTP allowed)'));
  console.log('    - sameSite: ' + (isProduction ? 'none' : 'lax'));
  console.log('    - path: /');
  console.log('    - maxAge: 1 year');
}

async function main() {
  console.log('🔍 Authentication Diagnostic Tool\n');
  console.log('This tool checks your authentication configuration...\n');

  await checkEnvironmentVariables();
  await checkJWTSecret();
  const dbConnected = await checkDatabase();
  await checkOAuthConfig();
  
  if (dbConnected) {
    await checkTestUser();
  }
  
  await checkCookieConfig();

  console.log('\n=== Summary ===');
  console.log('\nCommon Issues:');
  console.log('1. Missing JWT_SECRET - Set a secure random string (32+ chars)');
  console.log('2. Missing GOOGLE_CLIENT_ID/SECRET - OAuth login will fail');
  console.log('3. Wrong GOOGLE_REDIRECT_URI - Must match Google Console settings');
  console.log('4. Database connection issues - Check DATABASE_URL');
  console.log('5. Cookie issues - Ensure cookies are enabled in browser');
  console.log('\nNext Steps:');
  console.log('- Check server logs for detailed error messages');
  console.log('- Test login flow: /api/auth/login (email) or /api/oauth/google (OAuth)');
  console.log('- Verify cookies are being set: Check browser DevTools > Application > Cookies');
  console.log('\n');
}

main().catch(console.error);

