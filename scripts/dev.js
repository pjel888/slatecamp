#!/usr/bin/env node
/**
 * Dev server launcher. On Windows, Turbopack can hit a bug where the CSS
 * pipeline resolves a path to "nul" (reserved device name), so we use
 * Webpack there. On other platforms we use Turbopack for faster dev.
 */
/* eslint-disable @typescript-eslint/no-require-imports -- Node script, no ESM in package */
const { spawn } = require("child_process");
const isWindows = process.platform === "win32";
const args = ["dev", ...(isWindows ? ["--webpack"] : ["--turbopack"])];
const child = spawn("next", args, { stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));
