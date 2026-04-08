#!/usr/bin/env node
/**
 * Dev server launcher. Uses Turbopack on all platforms (default in Next.js 16).
 * The old Windows "nul" CSS path bug was fixed in Next.js 16.1+.
 * Pass --webpack flag to force Webpack if needed: bun run dev -- --webpack
 */
/* eslint-disable @typescript-eslint/no-require-imports -- Node script, no ESM in package */
const { spawn } = require("child_process");
const path = require("path");
const nextCli = path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next");
const useWebpack = process.argv.includes("--webpack");
const args = ["dev", ...(useWebpack ? ["--webpack"] : ["--turbopack"])];
const child = spawn(process.execPath, [nextCli, ...args], { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));
