const assert = require('assert');
const { RapidfireRepl } = require('../src/repl');

console.log('--- TEST: REPL PROMPT RESTORATION AFTER SHELL COMMANDS ---');

async function runTests() {
  const repl = new RapidfireRepl();
  let promptCount = 0;
  const origPrompt = repl.prompt.bind(repl);

  repl.prompt = () => {
    promptCount++;
    origPrompt();
  };

  repl.start();

  // Test 1: Initial prompt was displayed on start
  console.log('[Test 1] Testing initial REPL prompt generation...');
  assert.strictEqual(promptCount, 1, 'Initial prompt should be displayed upon start');
  assert.strictEqual(repl.isPassthroughRunning, false, 'isPassthroughRunning should be false initially');

  // Test 2: Fast output command automatically restores prompt
  console.log('[Test 2] Testing prompt restoration after command with stdout...');
  await repl.handleLine('echo "RAPIDFIRE_TEST_STREAM"');
  await new Promise((r) => setTimeout(r, 600));

  assert.strictEqual(promptCount, 2, 'Prompt must be called after command finishes');
  assert.strictEqual(repl.isPassthroughRunning, false, 'isPassthroughRunning must return to false');

  // Test 3: Silent command (like git add or mkdir) restores prompt
  console.log('[Test 3] Testing prompt restoration after silent command (no stdout)...');
  await repl.handleLine('echo -n ""');
  await new Promise((r) => setTimeout(r, 600));

  assert.strictEqual(promptCount, 3, 'Prompt must be called even when command has zero stdout');
  assert.strictEqual(repl.isPassthroughRunning, false, 'isPassthroughRunning must return to false for silent command');

  // Test 4: Long-running command (> 1.5 seconds) does not timeout prematurely and restores prompt upon completion
  console.log('[Test 4] Testing delayed/network command execution without premature timeout...');
  const isWin = process.platform === 'win32';
  const sleepCmd = isWin ? 'Start-Sleep -Seconds 2' : 'sleep 2';

  await repl.handleLine(sleepCmd);

  // At 800ms, command is still executing
  await new Promise((r) => setTimeout(r, 800));
  assert.strictEqual(promptCount, 3, 'Prompt should NOT fire prematurely while command is running');
  assert.strictEqual(repl.isPassthroughRunning, true, 'isPassthroughRunning should stay true during execution');

  // At 2400ms, command has finished and sentinel triggered
  await new Promise((r) => setTimeout(r, 1600));
  assert.strictEqual(promptCount, 4, 'Prompt must fire automatically when long command finishes');
  assert.strictEqual(repl.isPassthroughRunning, false, 'isPassthroughRunning must be reset to false');

  // Test 5: Multi-stage command with mid-stream pause (e.g. npm publish simulation)
  console.log('[Test 5] Testing command with mid-stream pause to verify NO mid-stream prompt...');
  const multiPhaseCmd = isWin
    ? 'pwsh -NoLogo -NoProfile -Command "Write-Host \'Phase 1\'; Start-Sleep -Milliseconds 600; Write-Host \'Phase 2\'"'
    : 'sh -c "echo Phase 1; sleep 0.6; echo Phase 2"';

  await repl.handleLine(multiPhaseCmd);

  // At 350ms, Phase 1 has printed and command is paused in sleep
  await new Promise((r) => setTimeout(r, 350));
  assert.strictEqual(promptCount, 4, 'Prompt must NOT appear mid-stream during output pause');
  assert.strictEqual(repl.isPassthroughRunning, true, 'Passthrough must remain active across pauses');

  // At 1000ms, Phase 2 has printed and sentinel has arrived
  await new Promise((r) => setTimeout(r, 700));
  assert.strictEqual(promptCount, 5, 'Prompt must fire exactly once at the end of the entire command');
  assert.strictEqual(repl.isPassthroughRunning, false, 'Passthrough must finish cleanly');

  console.log('✓ All REPL prompt return test scenarios verified successfully!');

  repl.shutdown();
}

runTests().catch((err) => {
  console.error('REPL prompt test failed:', err);
  process.exit(1);
});
