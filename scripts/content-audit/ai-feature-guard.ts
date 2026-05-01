#!/usr/bin/env bun
import { parseArgs } from './lib'

const options = parseArgs()
const feature = options.command ?? 'ai-feature'
console.error(`${feature} is intentionally disabled for the content round-trip foundation: no AI APIs, fact-checking, or automatic rewriting are integrated in this milestone.`)
process.exit(2)
