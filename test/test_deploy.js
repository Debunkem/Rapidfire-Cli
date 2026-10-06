const assert = require('assert');
const { matchCommand } = require('../src/commands');

console.log('--- TEST: DEPLOY COMMAND MATCHING ---');

const deployCmd = matchCommand('deploy');
assert(deployCmd, 'deploy command must be recognized');
assert.strictEqual(deployCmd.name, 'deploy');

const deployFolderCmd = matchCommand('deploy my_app');
assert(deployFolderCmd, 'deploy with folder argument must be recognized');
assert.strictEqual(deployFolderCmd.name, 'deploy');

console.log('✓ Deploy command recognized and routed correctly.');
