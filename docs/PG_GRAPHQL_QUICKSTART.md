# pg_graphql Quick Start

Get started with pg_graphql in 5 minutes.

## 1. Enable Extension

```bash
pnpm db:enable-graphql
```

Or manually:
```sql
CREATE EXTENSION IF NOT EXISTS pg_graphql;
```

## 2. Check Health

```typescript
import { trpc } from './trpc-client';

const health = await trpc.graphql.health.query();
console.log(health); // { available: true, status: "operational" }
```

## 3. Query Your Data

```typescript
// Get users
const result = await trpc.graphql.query.mutate({
  query: `
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
  `,
});

const users = result.data?.usersCollection?.edges?.map(e => e.node) || [];
```

## Common Queries

### Filter by Email
```graphql
{
  usersCollection(filter: { email: { eq: "user@example.com" } }) {
    edges {
      node {
        id
        email
      }
    }
  }
}
```

### Sort by Created Date
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

### Get Related Data
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
            }
          }
        }
      }
    }
  }
}
```

## List Available Tables

```typescript
const { collections } = await trpc.graphql.collections.query();
console.log(collections.map(c => c.name));
// ["usersCollection", "tasksCollection", ...]
```

## Full Documentation

See [PG_GRAPHQL_SETUP.md](./PG_GRAPHQL_SETUP.md) for complete documentation.


