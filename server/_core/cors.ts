/**
 * CORS Middleware
 * Shared CORS configuration for all API endpoints (web and mobile)
 */

import type { Request, Response, NextFunction } from "express";

/**
 * CORS middleware for API endpoints
 * Supports both web and mobile browsers
 */
export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Get origin from request
  const origin = req.headers.origin;

  // Allow all origins for public API (can be restricted per environment)
  // For mobile apps and web browsers, we need to allow cross-origin requests
  // Note: When using credentials, we should use specific origins instead of "*"
  // For now, we allow all origins for maximum compatibility
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    // Only set credentials header if we have a specific origin
    // (browsers don't allow credentials with "*")
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    // No origin header (e.g., same-origin request or mobile app)
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  
  // Allowed HTTP methods
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  
  // Allowed headers (including mobile-specific headers)
  res.setHeader(
    "Access-Control-Allow-Headers",
    [
      "Content-Type",
      "Authorization",
      "X-Request-ID",
      "X-API-Key",
      "Accept",
      "Accept-Language",
      "Cache-Control",
      "Pragma",
    ].join(", ")
  );
  
  // Headers that can be read by the client
  res.setHeader(
    "Access-Control-Expose-Headers",
    [
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-RateLimit-Reset",
      "X-Response-Time",
      "X-Request-ID",
      "Content-Length",
      "Content-Type",
    ].join(", ")
  );

  // Cache preflight requests for 24 hours (mobile browsers benefit from this)
  res.setHeader("Access-Control-Max-Age", "86400");

  // Handle preflight requests (OPTIONS)
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
}

