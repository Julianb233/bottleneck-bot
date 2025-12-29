/**
 * Backend Verification Script
 * Tests all backend endpoints from both web and mobile user agents
 * Ensures CORS and API functionality works correctly on all platforms
 */

import { chromium, type Browser, type Page } from "playwright";

interface TestResult {
  endpoint: string;
  method: string;
  userAgent: string;
  status: number;
  success: boolean;
  error?: string;
  corsHeaders?: {
    allowOrigin?: string;
    allowMethods?: string;
    allowHeaders?: string;
    allowCredentials?: string;
  };
  responseTime: number;
}

interface TestConfig {
  baseUrl: string;
  userAgents: {
    name: string;
    userAgent: string;
  }[];
  endpoints: {
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS";
    requiresAuth?: boolean;
    body?: any;
  }[];
}

const config: TestConfig = {
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  userAgents: [
    {
      name: "Desktop Chrome",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    {
      name: "Desktop Safari",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    },
    {
      name: "iPhone Safari",
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    },
    {
      name: "Android Chrome",
      userAgent:
        "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    },
    {
      name: "iPad Safari",
      userAgent:
        "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    },
  ],
  endpoints: [
    // Health endpoints
    { path: "/api/health", method: "GET" },
    { path: "/api/v1/health", method: "GET" },
    { path: "/api/v1", method: "GET" },
    
    // Auth endpoints (should return 400/401 without credentials, but CORS should work)
    { path: "/api/auth/login", method: "POST", body: {} },
    { path: "/api/auth/signup", method: "POST", body: {} },
    
    // tRPC endpoint (should return 400/404 but CORS should work)
    { path: "/api/trpc/system.notifyOwner", method: "GET" },
    
    // REST API endpoints (should return 401 without API key, but CORS should work)
    { path: "/api/v1/tasks", method: "GET" },
    { path: "/api/v1/executions", method: "GET" },
    { path: "/api/v1/templates", method: "GET" },
    
    // Webhook endpoints
    { path: "/api/webhooks", method: "POST", body: {} },
    
    // OPTIONS preflight requests
    { path: "/api/health", method: "OPTIONS" },
    { path: "/api/trpc/system.notifyOwner", method: "OPTIONS" },
    { path: "/api/v1/tasks", method: "OPTIONS" },
  ],
};

async function testEndpoint(
  page: Page,
  endpoint: string,
  method: string,
  userAgent: string,
  body?: any
): Promise<TestResult> {
  const startTime = Date.now();
  const fullUrl = `${config.baseUrl}${endpoint}`;

  try {
    const options: any = {
      method: method as any,
      headers: {
        "User-Agent": userAgent,
        "Origin": config.baseUrl,
        "Accept": "application/json",
      },
    };

    if (body && method !== "GET" && method !== "OPTIONS") {
      options.data = body;
      options.headers["Content-Type"] = "application/json";
    }

    const response = await page.request.fetch(fullUrl, options);
    const responseTime = Date.now() - startTime;

    // Extract CORS headers
    const headers = response.headers();
    const corsHeaders = {
      allowOrigin: headers["access-control-allow-origin"],
      allowMethods: headers["access-control-allow-methods"],
      allowHeaders: headers["access-control-allow-headers"],
      allowCredentials: headers["access-control-allow-credentials"],
    };

    const status = response.status();
    const success = status < 500; // Consider 4xx as success (expected without auth)

    return {
      endpoint,
      method,
      userAgent,
      status,
      success,
      corsHeaders,
      responseTime,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      endpoint,
      method,
      userAgent,
      status: 0,
      success: false,
      error: error.message,
      responseTime,
    };
  }
}

async function runTests(): Promise<void> {
  console.log("🚀 Starting Backend Verification Tests\n");
  console.log(`Base URL: ${config.baseUrl}\n`);

  const browser = await chromium.launch({ headless: true });
  const results: TestResult[] = [];

  for (const ua of config.userAgents) {
    console.log(`\n📱 Testing with ${ua.name}...`);
    console.log(`   User-Agent: ${ua.userAgent.substring(0, 60)}...`);

    const context = await browser.newContext({
      userAgent: ua.userAgent,
    });
    const page = await context.newPage();

    for (const endpoint of config.endpoints) {
      const result = await testEndpoint(
        page,
        endpoint.path,
        endpoint.method,
        ua.name,
        endpoint.body
      );
      results.push(result);

      // Print result
      const statusIcon = result.success ? "✅" : "❌";
      const corsIcon = result.corsHeaders?.allowOrigin ? "🌐" : "⚠️";
      console.log(
        `   ${statusIcon} ${corsIcon} ${endpoint.method} ${endpoint.path} - ${result.status} (${result.responseTime}ms)`
      );

      if (!result.success && result.error) {
        console.log(`      Error: ${result.error}`);
      }
    }

    await context.close();
  }

  await browser.close();

  // Generate summary report
  console.log("\n\n" + "=".repeat(80));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(80));

  const totalTests = results.length;
  const successfulTests = results.filter((r) => r.success).length;
  const failedTests = totalTests - successfulTests;

  console.log(`\nTotal Tests: ${totalTests}`);
  console.log(`✅ Successful: ${successfulTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);

  // CORS analysis
  const corsWorking = results.filter(
    (r) => r.corsHeaders?.allowOrigin || r.corsHeaders?.allowOrigin === "*"
  ).length;
  console.log(`\n🌐 CORS Headers Present: ${corsWorking}/${totalTests}`);

  // Performance analysis
  const avgResponseTime =
    results.reduce((sum, r) => sum + r.responseTime, 0) / totalTests;
  const maxResponseTime = Math.max(...results.map((r) => r.responseTime));
  const minResponseTime = Math.min(...results.map((r) => r.responseTime));

  console.log(`\n⏱️  Performance:`);
  console.log(`   Average: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`   Min: ${minResponseTime}ms`);
  console.log(`   Max: ${maxResponseTime}ms`);

  // Endpoint-specific analysis
  console.log(`\n📋 Endpoint Analysis:`);
  const endpointGroups = new Map<string, TestResult[]>();
  results.forEach((r) => {
    const key = `${r.method} ${r.endpoint}`;
    if (!endpointGroups.has(key)) {
      endpointGroups.set(key, []);
    }
    endpointGroups.get(key)!.push(r);
  });

  endpointGroups.forEach((tests, endpoint) => {
    const successCount = tests.filter((t) => t.success).length;
    const avgTime =
      tests.reduce((sum, t) => sum + t.responseTime, 0) / tests.length;
    const statusIcon = successCount === tests.length ? "✅" : "⚠️";
    console.log(
      `   ${statusIcon} ${endpoint}: ${successCount}/${tests.length} passed (avg ${avgTime.toFixed(0)}ms)`
    );
  });

  // User agent-specific analysis
  console.log(`\n📱 User Agent Analysis:`);
  const uaGroups = new Map<string, TestResult[]>();
  results.forEach((r) => {
    if (!uaGroups.has(r.userAgent)) {
      uaGroups.set(r.userAgent, []);
    }
    uaGroups.get(r.userAgent)!.push(r);
  });

  uaGroups.forEach((tests, ua) => {
    const successCount = tests.filter((t) => t.success).length;
    const corsCount = tests.filter(
      (t) => t.corsHeaders?.allowOrigin || t.corsHeaders?.allowOrigin === "*"
    ).length;
    const statusIcon = successCount === tests.length ? "✅" : "⚠️";
    console.log(
      `   ${statusIcon} ${ua}: ${successCount}/${tests.length} passed, ${corsCount}/${tests.length} CORS headers`
    );
  });

  // Issues found
  const issues: string[] = [];
  if (failedTests > 0) {
    issues.push(`${failedTests} tests failed`);
  }
  const missingCors = totalTests - corsWorking;
  if (missingCors > 0) {
    issues.push(`${missingCors} endpoints missing CORS headers`);
  }
  if (avgResponseTime > 2000) {
    issues.push(`Average response time is high: ${avgResponseTime.toFixed(0)}ms`);
  }

  if (issues.length > 0) {
    console.log(`\n⚠️  Issues Found:`);
    issues.forEach((issue) => console.log(`   - ${issue}`));
  } else {
    console.log(`\n✅ All tests passed! Backend is ready for web and mobile.`);
  }

  console.log("\n" + "=".repeat(80));
}

// Run tests
runTests().catch((error) => {
  console.error("❌ Test execution failed:", error);
  process.exit(1);
});

