#!/usr/bin/env node
/**
 * Dev server launcher — auto-cleans stale state for clean startup.
 *
 * Uses Turbopack on all platforms (default in Next.js 16).
 * Pass --webpack to force Webpack: bun run dev -- --webpack
 *
 * On startup:
 * 1. Kills any process holding port 3000 (Next.js servers from past sessions)
 * 2. Removes the Turbopack build cache to prevent stale-hash corruption
 *    (errors like "Failed to load external module ...-/rsc" or "Expected unicode escape")
 * 3. Starts fresh
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const PROJECT_DIR = path.resolve(__dirname, "..");

// ── Kill anything on port 3000 ──────────────────────────────────────────────
// Stale Next.js dev servers from previous sessions can hold port 3000,
// cause port conflicts, and leave corrupted Turbopack caches behind.

function killProcessOnPort3000() {
  try {
    // macOS: lsof -ti tcp:3000 returns PIDs of everything listening on :3000
    // Linux: ss -tlnp ... would work but we stick with lsof for cross-platform
    const pids = execSync("lsof -ti tcp:3000 2>/dev/null || true", {
      encoding: "utf8",
      timeout: 3000,
    })
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter((p) => /^\d+$/.test(p));

    if (pids.length > 0) {
      process.stdout.write(
        `  Cleaning port 3000: killing ${pids.length} process(es)\n`,
      );
      for (const pid of pids) {
        execSync(`kill -9 ${pid} 2>/dev/null || true`, { timeout: 2000 });
      }
      // Wait for port to be released
      execSync("sleep 0.5", { timeout: 2000 });
    }
  } catch {
    // lsof not available or port not in use — continue
  }
}

// ── Clear full .next cache ─────────────────────────────────────────────────
// Turbopack stores compiled SSR chunks in a persistent SQLite database
// inside .next/dev. Stale hash references (next-mdx-remote-<hash>/rsc,
// jsdom-<hash>, etc.) survive individual cache clears because they're
// baked into the database rows. Full wipe is the only reliable fix.

function clearBuildCache() {
  const nextDir = path.join(PROJECT_DIR, ".next");
  if (!fs.existsSync(nextDir)) return;

  try {
    execSync(`rm -rf "${nextDir}" 2>/dev/null || true`, { timeout: 5000 });
    process.stdout.write("  Cleared .next build cache\n");
  } catch {
    // rm failed — skip
  }
}

// ── Launch ─────────────────────────────────────────────────────────────────

if (process.argv.includes("--no-clean")) {
  // Skip cleanup for rapid iterations
  process.stdout.write("  Skipping cleanup (--no-clean)\n");
} else {
  killProcessOnPort3000();
  clearBuildCache();
}

const nextCli = path.join(
  PROJECT_DIR,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);
const useWebpack = process.argv.includes("--webpack");
const args = ["dev", ...(useWebpack ? ["--webpack"] : ["--turbopack"])];
const child = spawn(process.execPath, [nextCli, ...args], { stdio: "inherit" });

child.on("exit", (code) => process.exit(code ?? 0));
