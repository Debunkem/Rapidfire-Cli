const assert = require('assert');
const {
  highlightSyntax,
  createCompleter,
  RAPIDFIRE_COMMANDS,
  SHELL_COMMANDS,
  RECIPES
} = require('../src/utils/highlighter');
const { RapidfireRepl } = require('../src/repl');

function runTests() {
  console.log('--- TEST: REAL-TIME SYNTAX HIGHLIGHTER & TAB COMPLETER ---');

  // Test 1: RapidFire commands in Cyan
  console.log('[Test 1] Testing RapidFire command highlighting...');
  const setupCol = highlightSyntax('setup react');
  assert(setupCol.includes('\x1b[1;36msetup\x1b[0m'), 'setup should be bold cyan');
  assert(setupCol.includes('\x1b[1;32mreact\x1b[0m'), 'react recipe should be bold green');

  const expCol = highlightSyntax('explain src/repl.js');
  assert(expCol.includes('\x1b[1;36mexplain\x1b[0m'), 'explain should be bold cyan');
  console.log('✓ RapidFire command highlighting verified.');

  // Test 2: Host shell commands (init, git, etc.) in Yellow (PowerShell style)
  console.log('[Test 2] Testing host shell keyword highlighting (init, git, cd)...');
  const initCol = highlightSyntax('init git');
  assert(initCol.includes('\x1b[1;33minit\x1b[0m'), 'init should be bold yellow');

  const gitCol = highlightSyntax('git status');
  assert(gitCol.includes('\x1b[1;33mgit\x1b[0m'), 'git should be bold yellow');
  console.log('✓ Host shell keyword highlighting verified.');

  // Test 3: Flags and quoted strings
  console.log('[Test 3] Testing flags and string highlighting...');
  const flagCol = highlightSyntax('git commit -m "echo fix"');
  assert(flagCol.includes('\x1b[33m-m\x1b[0m'), '-m flag should be yellow');
  assert(flagCol.includes('\x1b[32m"echo fix"\x1b[0m'), 'quoted string should be green');
  console.log('✓ Flags and strings highlighting verified.');

  // Test 4: Tab autocompleter
  console.log('[Test 4] Testing Tab autocompleter...');
  const completer = createCompleter();

  const [topHits] = completer('exp');
  assert(topHits.includes('explain'), 'Tab completion should find explain');

  const [initHits] = completer('in');
  assert(initHits.includes('init'), 'Tab completion should find init');

  const [recipeHits] = completer('setup re');
  assert(recipeHits.includes('setup react'), 'Tab completion should find setup react');
  assert(recipeHits.includes('setup react+fastapi'), 'Tab completion should find setup react+fastapi');

  const [keyHits] = completer('key ');
  assert(keyHits.includes('key status'), 'Tab completion should find key status');
  console.log('✓ Tab autocompleter verified.');

  // Test 5: RapidfireRepl initialization
  console.log('[Test 5] Testing RapidfireRepl initialization with highlighter hook...');
  const repl = new RapidfireRepl();
  assert(repl.shell !== null, 'Persistent shell should be initialized');
  repl.shell.kill();
  console.log('✓ RapidfireRepl integration verified.');

  console.log('\nALL SYNTAX HIGHLIGHTER & TAB COMPLETER TESTS PASSED CLEANLY!\n');
}

runTests();
