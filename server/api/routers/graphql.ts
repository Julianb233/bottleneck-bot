/**
 * GraphQL Router using pg_graphql
 * 
 * This router provides a GraphQL API endpoint that uses the pg_graphql
 * PostgreSQL extension to automatically generate GraphQL queries from your
 * database schema.
 * 
 * The pg_graphql extension runs entirely within PostgreSQL, providing:
 * - Automatic schema introspection
 * - Type-safe queries
 * - Respects PostgreSQL RLS policies
 * - No additional GraphQL server needed
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../../_core/trpc";
import { getPool } from "../../db";

const GraphQLQuerySchema = z.object({
  query: z.string().min(1, "GraphQL query is required"),
  variables: z.record(z.unknown()).optional(),
  operationName: z.string().optional(),
});

/**
 * Execute a GraphQL query using pg_graphql
 */
async function executeGraphQLQuery(
  query: string,
  variables?: Record<string, unknown>
): Promise<unknown> {
  const pool = await getPool();
  if (!pool) {
    throw new Error("Database connection not available");
  }

  const client = await pool.connect();
  try {
    // pg_graphql uses the graphql.resolve() function
    // Variables are passed as JSONB
    const variablesJson = variables ? JSON.stringify(variables) : "{}";
    
    const result = await client.query(
      `SELECT graphql.resolve($1::text, $2::jsonb) as result`,
      [query, variablesJson]
    );

    const response = result.rows[0].result;
    
    // Parse the JSON response
    if (typeof response === "string") {
      return JSON.parse(response);
    }
    
    return response;
  } finally {
    client.release();
  }
}

export const graphqlRouter = router({
  /**
   * Execute a GraphQL query
   * 
   * Example query:
   * {
   *   usersCollection(first: 10) {
   *     edges {
   *       node {
   *         id
   *         email
   *         name
   *       }
   *     }
   *   }
   * }
   */
  query: protectedProcedure
    .input(GraphQLQuerySchema)
    .mutation(async ({ input }) => {
      try {
        const result = await executeGraphQLQuery(
          input.query,
          input.variables
        );

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error("[GraphQL] Query execution failed:", error);
        
        if (error instanceof Error) {
          return {
            success: false,
            error: {
              message: error.message,
              // Extract GraphQL errors if present
              details: error.message.includes("graphql") 
                ? error.message 
                : undefined,
            },
          };
        }

        throw error;
      }
    }),

  /**
   * Get the GraphQL schema introspection
   * Useful for GraphQL clients to understand available types and queries
   */
  introspect: protectedProcedure.query(async () => {
    const introspectionQuery = `
      {
        __schema {
          queryType {
            name
            fields {
              name
              description
              type {
                name
                kind
              }
            }
          }
          types {
            name
            kind
            description
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      }
    `;

    try {
      const result = await executeGraphQLQuery(introspectionQuery);
      return {
        success: true,
        schema: result,
      };
    } catch (error) {
      console.error("[GraphQL] Introspection failed:", error);
      throw error;
    }
  }),

  /**
   * List all available collections (tables) in the GraphQL schema
   */
  collections: protectedProcedure.query(async () => {
    const query = `
      {
        __type(name: "Query") {
          fields {
            name
            description
            type {
              name
              kind
            }
          }
        }
      }
    `;

    try {
      const result = await executeGraphQLQuery(query);
      const fields = (result as any)?.data?.__type?.fields || [];
      const collections = fields
        .filter((field: any) => field.name.endsWith("Collection"))
        .map((field: any) => ({
          name: field.name,
          description: field.description,
          type: field.type?.name,
        }));

      return {
        success: true,
        collections,
      };
    } catch (error) {
      console.error("[GraphQL] Collections query failed:", error);
      throw error;
    }
  }),

  /**
   * Health check for pg_graphql extension
   */
  health: publicProcedure.query(async () => {
    const pool = await getPool();
    if (!pool) {
      return {
        available: false,
        error: "Database connection not available",
      };
    }

    const client = await pool.connect();
    try {
      // Check if extension exists
      const extResult = await client.query(`
        SELECT EXISTS(
          SELECT 1 FROM pg_extension WHERE extname = 'pg_graphql'
        ) as exists;
      `);

      if (!extResult.rows[0].exists) {
        return {
          available: false,
          error: "pg_graphql extension not installed",
        };
      }

      // Test with a simple query
      const testQuery = `{
        __schema {
          queryType {
            name
          }
        }
      }`;
      await client.query(
        `SELECT graphql.resolve($1::text) as result`,
        [testQuery]
      );

      return {
        available: true,
        version: "unknown", // pg_graphql doesn't expose version easily
        status: "operational",
      };
    } catch (error) {
      return {
        available: true,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      client.release();
    }
  }),
});

