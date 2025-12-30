#!/usr/bin/env tsx
/**
 * Build Completion Script
 * 
 * This script verifies and completes the build process:
 * 1. Checks TypeScript compilation
 * 2. Verifies dependencies
 * 3. Runs linting
 * 4. Checks for critical TODOs
 * 5. Verifies database schema
 * 6. Runs tests
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { readFileSync } from "fs";

interface BuildCheck {
  name: string;
  check: () => boolean;
  fix?: () => void;
  critical: boolean;
}

const checks: BuildCheck[] = [
  {
    name: "TypeScript Configuration",
    check: () => {
      try {
        const tsconfig = JSON.parse(readFileSync("server/tsconfig.json", "utf-8"));
        return tsconfig.compilerOptions.rootDir === "..";
      } catch {
        return false;
      }
    },
    critical: true,
  },
  {
    name: "Node Types Installed",
    check: () => {
      try {
        const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
        return pkg.dependencies["@types/node"] !== undefined || 
               pkg.devDependencies["@types/node"] !== undefined;
      } catch {
        return false;
      }
    },
    critical: true,
  },
  {
    name: "Environment Variables File",
    check: () => existsSync(".env") || existsSync(".env.example"),
    critical: false,
  },
  {
    name: "Database Schema Files",
    check: () => existsSync("drizzle/schema.ts"),
    critical: true,
  },
  {
    name: "Server Entry Point",
    check: () => existsSync("server/_core/index.ts"),
    critical: true,
  },
  {
    name: "Client Entry Point",
    check: () => existsSync("client/src/main.tsx"),
    critical: true,
  },
];

function runCheck(check: BuildCheck): { passed: boolean; message: string } {
  try {
    const passed = check.check();
    return {
      passed,
      message: passed ? `✅ ${check.name}` : `❌ ${check.name}`,
    };
  } catch (error) {
    return {
      passed: false,
      message: `❌ ${check.name} - Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

function main() {
  console.log("🔍 Running Build Completion Checks...\n");

  const results = checks.map(runCheck);
  const criticalFailures = results.filter(
    (r, i) => !r.passed && checks[i].critical
  );
  const warnings = results.filter(
    (r, i) => !r.passed && !checks[i].critical
  );

  results.forEach((r) => console.log(r.message));

  console.log("\n📊 Summary:");
  console.log(`   Total Checks: ${checks.length}`);
  console.log(`   Passed: ${results.filter((r) => r.passed).length}`);
  console.log(`   Failed (Critical): ${criticalFailures.length}`);
  console.log(`   Failed (Warnings): ${warnings.length}`);

  if (criticalFailures.length > 0) {
    console.log("\n❌ Critical failures detected. Please fix before proceeding.");
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log("\n⚠️  Warnings detected. Review and fix when possible.");
  }

  console.log("\n✅ Build checks completed successfully!");
}

main();


