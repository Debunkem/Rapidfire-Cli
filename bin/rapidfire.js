#!/usr/bin/env node

const { startRepl } = require('../src/repl');

// Handle termination signals gracefully
process.on('SIGINT', () => {
  // If user hits Ctrl+C at prompt, let readline or shell handle it
});

process.on('SIGTERM', () => {
  process.exit(0);
});

try {
  startRepl();
} catch (err) {
  console.error('[rapidfire] Fatal error during startup:', err);
  process.exit(1);
}
