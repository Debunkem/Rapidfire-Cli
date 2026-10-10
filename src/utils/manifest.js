const path = require('path');
const fse = require('fs-extra');

const MANIFEST_FILENAME = '.rapidfire.json';
let CURRENT_VERSION = '0.1.23';
try {
  CURRENT_VERSION = require('../../package.json').version;
} catch {}

/**
 * Creates and writes a .rapidfire.json manifest in the project root
 */
function writeManifest(projectDir, { frontend, backend, folderName, generationMode }) {
  const manifestPath = path.join(projectDir, MANIFEST_FILENAME);
  const data = {
    frontend: frontend || null,
    backend: backend || null,
    folderName: folderName || path.basename(projectDir),
    generationMode: generationMode || 'predefined',
    createdAt: new Date().toISOString(),
    rapidfireVersion: CURRENT_VERSION
  };

  fse.writeJsonSync(manifestPath, data, { spaces: 2 });
  return data;
}

/**
 * Reads .rapidfire.json manifest from a directory
 */
function readManifest(projectDir) {
  const manifestPath = path.join(projectDir, MANIFEST_FILENAME);
  if (!fse.existsSync(manifestPath)) {
    return null;
  }

  try {
    return fse.readJsonSync(manifestPath);
  } catch {
    return null;
  }
}

/**
 * Checks whether a directory contains a .rapidfire.json manifest
 */
function hasManifest(projectDir) {
  return fse.existsSync(path.join(projectDir, MANIFEST_FILENAME));
}

module.exports = {
  MANIFEST_FILENAME,
  CURRENT_VERSION,
  writeManifest,
  readManifest,
  hasManifest
};
