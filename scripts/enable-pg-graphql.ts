#!/usr/bin/env tsx
/**
 * Enable pg_graphql extension in PostgreSQL database
 * 
 * This script enables the pg_graphql extension which automatically generates
 * a GraphQL API from your database schema.
 * 
 * Usage:
 *   pnpm tsx scripts/enable-pg-graphql.ts
 */

import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

async function enablePgGraphql() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("❌ DATABASE_URL is required");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("🔌 Connecting to database...");
    const client = await pool.connect();
    
    try {
      // Check if extension is already installed
      console.log("📦 Checking if pg_graphql extension exists...");
      const checkResult = await client.query(`
        SELECT EXISTS(
          SELECT 1 FROM pg_extension WHERE extname = 'pg_graphql'
        ) as exists;
      `);

      if (checkResult.rows[0].exists) {
        console.log("✅ pg_graphql extension is already installed");
        
        // Check version
        const versionResult = await client.query(`
          SELECT extversion FROM pg_extension WHERE extname = 'pg_graphql';
        `);
        console.log(`   Version: ${versionResult.rows[0]?.extversion || 'unknown'}`);
      } else {
        console.log("📥 Installing pg_graphql extension...");
        
        // Enable the extension
        await client.query(`
          CREATE EXTENSION IF NOT EXISTS pg_graphql;
        `);
        
        console.log("✅ pg_graphql extension installed successfully!");
        
        // Get version
        const versionResult = await client.query(`
          SELECT extversion FROM pg_extension WHERE extname = 'pg_graphql';
        `);
        console.log(`   Version: ${versionResult.rows[0]?.extversion || 'unknown'}`);
      }

      // Test the extension by querying the schema
      console.log("\n🧪 Testing pg_graphql...");
      const testResult = await client.query(`
        SELECT graphql.resolve($$
          {
            __schema {
              queryType {
                name
              }
            }
          }
        $$);
      `);

      const schema = JSON.parse(testResult.rows[0].graphql_resolve);
      console.log("✅ pg_graphql is working!");
      console.log(`   Query type: ${schema.data?.__schema?.queryType?.name || 'unknown'}`);

      // List available collections (tables)
      console.log("\n📊 Available GraphQL collections:");
      const collectionsResult = await client.query(`
        SELECT graphql.resolve($$
          {
            __type(name: "Query") {
              fields {
                name
                description
              }
            }
          }
        $$);
      `);

      const collections = JSON.parse(collectionsResult.rows[0].graphql_resolve);
      const fields = collections.data?.__type?.fields || [];
      const collectionFields = fields.filter((f: any) => f.name.endsWith('Collection'));
      
      if (collectionFields.length > 0) {
        collectionFields.forEach((field: any) => {
          console.log(`   - ${field.name}`);
        });
      } else {
        console.log("   (No collections found - ensure tables exist in your schema)");
      }

    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Error enabling pg_graphql:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("extension") && error.message.includes("not available")) {
        console.error("\n💡 Tip: pg_graphql may not be available in your PostgreSQL instance.");
        console.error("   - Neon: pg_graphql is available by default");
        console.error("   - Supabase: pg_graphql is available by default");
        console.error("   - Self-hosted: Install from https://github.com/supabase/pg_graphql");
      }
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

enablePgGraphql();


