const fs = require('fs');
const path = require('path');
const os = require('os');
const fse = require('fs-extra');

const CONFIG_ROOT = path.join(os.homedir(), '.rapidfire');
const PRESETS_DIR = path.join(CONFIG_ROOT, 'presets');
const USER_CONFIG_FILE = path.join(CONFIG_ROOT, 'config.json');

function ensureConfigDirs() {
  fse.ensureDirSync(CONFIG_ROOT);
  fse.ensureDirSync(PRESETS_DIR);
}

function getConfigRoot() {
  ensureConfigDirs();
  return CONFIG_ROOT;
}

function getPresetsDir() {
  ensureConfigDirs();
  return PRESETS_DIR;
}

function getPresetPath(name) {
  const safeName = name.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const filename = safeName.endsWith('.json') ? safeName : `${safeName}.json`;
  return path.join(getPresetsDir(), filename);
}

function listPresets() {
  ensureConfigDirs();
  const files = fs.readdirSync(PRESETS_DIR);
  return files
    .filter(file => file.endsWith('.json'))
    .map(file => path.basename(file, '.json'));
}

function getUserConfig() {
  ensureConfigDirs();
  if (!fs.existsSync(USER_CONFIG_FILE)) {
    return {};
  }
  try {
    return fse.readJsonSync(USER_CONFIG_FILE);
  } catch {
    return {};
  }
}

function saveUserConfig(updates) {
  ensureConfigDirs();
  const current = getUserConfig();
  const merged = { ...current, ...updates };
  fse.writeJsonSync(USER_CONFIG_FILE, merged, { spaces: 2 });
  return merged;
}

module.exports = {
  CONFIG_ROOT,
  PRESETS_DIR,
  USER_CONFIG_FILE,
  ensureConfigDirs,
  getConfigRoot,
  getPresetsDir,
  getPresetPath,
  listPresets,
  getUserConfig,
  saveUserConfig
};
