#!/bin/bash
# Script to add environment variables to Vercel from your documentation

echo "🚀 Setting up Vercel Environment Variables..."
echo ""

# Essential Variables from VERCEL_DEPLOYMENT.md and ENV_SETUP_GUIDE.md
echo "Adding essential environment variables..."

# Database (from ENV_SETUP_GUIDE.md)
vercel env add DATABASE_URL production <<< "postgresql://neondb_owner:npg_BDuynUv93aHd@ep-frosty-butterfly-ahz6v6bh-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Playwright (required for Vercel)
vercel env add PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD production <<< "1"

# Node Environment
vercel env add NODE_ENV production <<< "production"

# Vercel flag
vercel env add VERCEL production <<< "1"

echo ""
echo "✅ Essential variables added!"
echo ""
echo "⚠️  You still need to add manually:"
echo "   - JWT_SECRET (generate with: openssl rand -hex 32)"
echo "   - ENCRYPTION_KEY (generate with: openssl rand -hex 32)"
echo "   - VITE_OAUTH_PORTAL_URL (your OAuth portal URL)"
echo "   - VITE_APP_ID (your app ID)"
echo "   - GOOGLE_CLIENT_ID (if using Google OAuth)"
echo "   - GOOGLE_CLIENT_SECRET (if using Google OAuth)"
echo "   - BROWSERBASE_API_KEY (if using Browserbase)"
echo "   - BROWSERBASE_PROJECT_ID (if using Browserbase)"
echo "   - OPENAI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY or ANTHROPIC_API_KEY (for AI features)"
echo ""
echo "To add more variables, use:"
echo "  vercel env add VARIABLE_NAME production"
echo ""

