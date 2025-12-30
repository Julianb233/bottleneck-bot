# pg_graphql Setup Guide

This guide explains how to set up and use `pg_graphql`, a PostgreSQL extension that automatically generates a GraphQL API from your database schema.

## What is pg_graphql?

`pg_graphql` is a PostgreSQL extension developed by Supabase that:
- Automatically generates a GraphQL schema from your PostgreSQL tables
- Executes GraphQL queries entirely within PostgreSQL (no external GraphQL server needed)
- Respects PostgreSQL Row Level Security (RLS) policies
- Provides type-safe queries based on your database schema

## Prerequisites

- PostgreSQL database (Neon, Supabase, or self-hosted PostgreSQL 14+)
- `pg_graphql` extension available in your database instance
  - ✅ Neon: Available by default
  - ✅ Supabase: Available by default
  - ⚠️ Self-hosted: Requires installation from [GitHub](https://github.com/supabase/pg_graphql)

## Installation

### Step 1: Enable the Extension

Run the installation script:

```bash
pnpm tsx scripts/enable-pg-graphql.ts
```

Or manually via SQL:

```sql
CREATE EXTENSION IF NOT EXISTS pg_graphql;
```

### Step 2: Verify Installation

Check that the extension is working:

```bash
# Via the health endpoint
curl http://localhost:3000/api/trpc/graphql.health

# Or via tRPC client
const health = await trpc.graphql.health.query();
console.log(health);
```

## Usage

### Via tRPC Client

```typescript
import { trpc } from './trpc-client';

// Execute a GraphQL query
const result = await trpc.graphql.query.mutate({
  query: `
    {
      usersCollection(first: 10) {
        edges {
          node {
            id
            email
            name
            createdAt
          }
        }
      }
    }
  `,
});

console.log(result.data);
```

### Query with Variables

```typescript
const result = await trpc.graphql.query.mutate({
  query: `
    query GetUser($id: Int!) {
      usersCollection(filter: { id: { eq: $id } }) {
        edges {
          node {
            id
            email
            name
          }
        }
      }
    }
  `,
  variables: {
    id: 1,
  },
});
```

### List Available Collections

```typescript
const collections = await trpc.graphql.collections.query();
console.log(collections.collections);
// Output: [{ name: "usersCollection", ... }, { name: "tasksCollection", ... }, ...]
```

### Get Schema Introspection

```typescript
const schema = await trpc.graphql.introspect.query();
console.log(schema.schema);
```

## GraphQL Query Examples

### Basic Query

```graphql
{
  usersCollection(first: 10) {
    edges {
      node {
        id
        email
        name
      }
    }
  }
}
```

### Filtering

```graphql
{
  usersCollection(
    filter: {
      email: { eq: "user@example.com" }
    }
  ) {
    edges {
      node {
        id
        email
      }
    }
  }
}
```

### Sorting

```graphql
{
  usersCollection(
    orderBy: { createdAt: DescNullsLast }
    first: 20
  ) {
    edges {
      node {
        id
        email
        createdAt
      }
    }
  }
}
```

### Pagination

```graphql
{
  usersCollection(
    first: 10
    after: "cursor-string"
  ) {
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    edges {
      cursor
      node {
        id
        email
      }
    }
  }
}
```

### Relationships

```graphql
{
  usersCollection(first: 5) {
    edges {
      node {
        id
        email
        userProfiles {
          edges {
            node {
              companyName
              phoneNumber
            }
          }
        }
      }
    }
  }
}
```

## API Endpoints

### `graphql.query`
Execute a GraphQL query.

**Type:** `mutation`  
**Input:**
```typescript
{
  query: string;           // GraphQL query string
  variables?: Record<string, unknown>;  // Optional variables
  operationName?: string;   // Optional operation name
}
```

**Example:**
```typescript
await trpc.graphql.query.mutate({
  query: "{ usersCollection(first: 10) { edges { node { id email } } } }",
});
```

### `graphql.collections`
List all available GraphQL collections (tables).

**Type:** `query`  
**Returns:** Array of collection names and metadata

**Example:**
```typescript
const result = await trpc.graphql.collections.query();
// { collections: [{ name: "usersCollection", ... }, ...] }
```

### `graphql.introspect`
Get full GraphQL schema introspection.

**Type:** `query`  
**Returns:** Complete GraphQL schema definition

**Example:**
```typescript
const schema = await trpc.graphql.introspect.query();
```

### `graphql.health`
Check if pg_graphql is available and working.

**Type:** `query`  
**Returns:** Health status

**Example:**
```typescript
const health = await trpc.graphql.health.query();
// { available: true, status: "operational" }
```

## Schema Naming Conventions

pg_graphql automatically generates GraphQL types based on your PostgreSQL schema:

- **Tables** → `{TableName}Collection` (e.g., `users` → `usersCollection`)
- **Columns** → Fields with the same name (e.g., `email`, `name`)
- **Foreign Keys** → Nested collections (e.g., `userProfiles` relation)

### Table Names

- Singular table names (`user`) become plural collections (`usersCollection`)
- Snake_case table names are converted to camelCase (`user_profiles` → `userProfilesCollection`)

## Security

### Row Level Security (RLS)

pg_graphql respects PostgreSQL RLS policies. If you have RLS enabled on tables, GraphQL queries will automatically enforce those policies.

**Example RLS Policy:**
```sql
-- Users can only see their own data
CREATE POLICY user_isolation ON users
  FOR SELECT
  USING (auth.uid() = id);
```

### Authentication

All GraphQL endpoints require authentication via the `protectedProcedure`. Make sure users are authenticated before accessing GraphQL queries.

## Troubleshooting

### Extension Not Available

**Error:** `extension "pg_graphql" is not available`

**Solution:**
- Neon/Supabase: Extension should be available by default
- Self-hosted: Install from [GitHub](https://github.com/supabase/pg_graphql)

### No Collections Found

**Issue:** `collections` query returns empty array

**Solution:**
- Ensure tables exist in your database schema
- Run `pnpm db:push` to create tables
- Check that tables are in the `public` schema

### Query Errors

**Error:** GraphQL query fails with syntax error

**Solution:**
- Verify GraphQL query syntax
- Check that table/column names match your schema
- Use `graphql.introspect` to see available types

### Performance Issues

**Issue:** Queries are slow

**Solution:**
- Add indexes on frequently queried columns
- Use `first` parameter to limit results
- Consider adding database indexes:
  ```sql
  CREATE INDEX idx_users_email ON users(email);
  ```

## Advanced Usage

### Custom Resolvers

pg_graphql works entirely within PostgreSQL. For custom business logic, you can:

1. Create PostgreSQL functions and expose them as GraphQL queries
2. Use database views to create custom GraphQL types
3. Combine pg_graphql queries with tRPC procedures for complex logic

### Integration with Existing tRPC API

You can use pg_graphql alongside your existing tRPC routers:

```typescript
// Use GraphQL for simple queries
const users = await trpc.graphql.query.mutate({ query: "..." });

// Use tRPC for complex business logic
const processedData = await trpc.ai.process.mutate({ ... });
```

## Resources

- [pg_graphql GitHub](https://github.com/supabase/pg_graphql)
- [pg_graphql Documentation](https://supabase.github.io/pg_graphql/)
- [Neon pg_graphql Guide](https://neon.com/docs/extensions/pg_graphql)
- [Supabase GraphQL Guide](https://supabase.com/docs/guides/database/extensions/pg_graphql)

## Example: Complete Query Flow

```typescript
// 1. Check health
const health = await trpc.graphql.health.query();
if (!health.available) {
  throw new Error("pg_graphql not available");
}

// 2. List available collections
const { collections } = await trpc.graphql.collections.query();
console.log("Available:", collections.map(c => c.name));

// 3. Query data
const result = await trpc.graphql.query.mutate({
  query: `
    {
      usersCollection(
        filter: { role: { eq: "admin" } }
        orderBy: { createdAt: DescNullsLast }
        first: 10
      ) {
        edges {
          node {
            id
            email
            name
            createdAt
          }
        }
      }
    }
  `,
});

// 4. Process results
const users = result.data?.usersCollection?.edges?.map(edge => edge.node) || [];
console.log(`Found ${users.length} admin users`);
```


