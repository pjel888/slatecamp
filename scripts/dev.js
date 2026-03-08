#!/usr/bin/env node
/**
 * Dev server launcher. On Windows, Turbopack can hit a bug where the CSS
 * pipeline resolves a path to "nul" (reserved device name), so we use
 * Webpack there. On other platforms we use Turbopack for faster dev.
 */
/* eslint-disable @typescript-eslint/no-require-imports -- Node script, no ESM in package */
const { spawn } = require("child_process");
const path = require("path");
const isWindows = process.platform === "win32";
const nextCli = path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next");
const args = ["dev", ...(isWindows ? ["--webpack"] : ["--turbopack"])];
const child = spawn(process.execPath, [nextCli, ...args], { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));
