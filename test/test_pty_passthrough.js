const assert = require('assert');
const { PersistentShell } = require('../src/shell');

console.log('--- TEST: PERSISTENT PTY PASSTHROUGH ---');

const shell = new PersistentShell();
let receivedOutput = '';

shell.onData((data) => {
  receivedOutput += data;
});

shell.write('echo "PASSTHROUGH_VERIFIED"');

setTimeout(() => {
  shell.kill();
  assert(
    receivedOutput.includes('PASSTHROUGH_VERIFIED'),
    'PTY output must include PASSTHROUGH_VERIFIED'
  );
  console.log('✓ Persistent PTY shell command execution and streaming verified.');
  process.exit(0);
}, 1200);
