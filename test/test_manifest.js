const assert = require('assert');
const path = require('path');
const os = require('os');
const fse = require('fs-extra');
const { writeManifest, readManifest, hasManifest, MANIFEST_FILENAME, CURRENT_VERSION } = require('../src/utils/manifest');

console.log('--- TEST: MANIFEST LIFECYCLE ---');

const tmpDir = path.join(os.tmpdir(), `test_manifest_${Date.now()}`);
fse.ensureDirSync(tmpDir);

try {
  assert(!hasManifest(tmpDir), 'Should not have manifest initially');
  assert.strictEqual(readManifest(tmpDir), null, 'readManifest should return null');

  const created = writeManifest(tmpDir, {
    frontend: 'react',
    backend: 'django',
    folderName: 'my-test-app'
  });

  assert(hasManifest(tmpDir), 'Should detect manifest after writing');
  const read = readManifest(tmpDir);
  assert.strictEqual(read.frontend, 'react');
  assert.strictEqual(read.backend, 'django');
  assert.strictEqual(read.folderName, 'my-test-app');
  assert.strictEqual(read.rapidfireVersion, CURRENT_VERSION);
  assert(read.createdAt, 'Should contain createdAt timestamp');

  console.log('✓ .rapidfire.json creation and reading verified successfully.');
} finally {
  fse.removeSync(tmpDir);
}
