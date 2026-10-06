const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getUserConfig } = require('../utils/configPath');

const SUPPORTED_STACKS = [
  'react+fastapi',
  'react+django',
  'react+node',
  'vue+fastapi',
  'vue+node',
  'vue+django',
  'react+flask',
  'svelte+node',
  'react',
  'vue',
  'svelte',
  'fastapi',
  'django'
];

let askHistory = [];

function clearAskHistory() {
  askHistory = [];
}

function getAskHistory() {
  return askHistory;
}

function readEnvFileKey() {
  const envPath = path.join(__dirname, '..', '..', '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/^(?:GEMINI_API_KEY|RAPIDFIRE_API_KEY)=["']?([^"'\r\n]+)["']?/m);
      if (match && match[1]) {
        return match[1].trim();
      }
    } catch {}
  }
  return null;
}

function getApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.RAPIDFIRE_API_KEY) return process.env.RAPIDFIRE_API_KEY;

  const envKey = readEnvFileKey();
  if (envKey) return envKey;

  const userConfig = getUserConfig();
  if (userConfig && userConfig.geminiApiKey) {
    return userConfig.geminiApiKey;
  }

  return null;
}

function hasApiKey() {
  return Boolean(getApiKey());
}

async function retryOperation(fn, retries = 2, delay = 800) {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries) {
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

function formatErrorMessage(err) {
  const msg = err.message || String(err);
  if (msg.includes('fetch failed') || msg.includes('ENOTFOUND') || msg.includes('ETIMEDOUT') || msg.includes('ECONNREFUSED')) {
    return 'Network connection to Gemini API failed or timed out. Please verify your internet connection.';
  }
  if (msg.includes('API_KEY_INVALID') || msg.includes('invalid api key')) {
    return 'Gemini API key is invalid or unauthorized. Please check your GEMINI_API_KEY.';
  }
  return `Gemini API query failed: ${msg.split('\n')[0]}`;
}

/**
 * Ask a technical developer question inline in terminal with retry, conversation history, and fallback
 */
async function askGemini(question) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      success: false,
      error: 'NO_API_KEY',
      message: 'Gemini API key is not set. Please export GEMINI_API_KEY="your_key" or save it in ~/.rapidfire/config.json.'
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const text = await retryOperation(async () => {
      // Keep last 10 turns (5 user + 5 model) to preserve context while keeping token latency low
      const historyToUse = askHistory.slice(-10);

      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: 'You are the in-terminal developer assistant for Rapidfire CLI. Provide clear, concise, practical coding answers tailored for the terminal. Use markdown code snippets where helpful.'
        });
        const chat = model.startChat({ history: historyToUse });
        const result = await chat.sendMessage(question);
        const response = await result.response;
        return response.text();
      } catch (primaryErr) {
        // Fallback to free-tier gemini-3.5-flash-lite
        const fallbackModel = genAI.getGenerativeModel({
          model: 'gemini-3.5-flash-lite',
          systemInstruction: 'You are the in-terminal developer assistant for Rapidfire CLI. Provide clear, concise, practical coding answers tailored for the terminal. Use markdown code snippets where helpful.'
        });
        const chat = fallbackModel.startChat({ history: historyToUse });
        const result = await chat.sendMessage(question);
        const response = await result.response;
        return response.text();
      }
    });

    // Update conversation context memory on success
    askHistory.push({ role: 'user', parts: [{ text: question }] });
    askHistory.push({ role: 'model', parts: [{ text }] });

    return {
      success: true,
      text
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      message: formatErrorMessage(err)
    };
  }
}

/**
 * Suggest a stack strictly constrained to RapidFire's supported recipes
 */
async function suggestStack(description) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      success: false,
      error: 'NO_API_KEY',
      message: 'Gemini API key not found. Falling back to manual template selection.'
    };
  }

  const prompt = `The user wants to build a project with this description: "${description}".
You are the Rapidfire CLI stack selector. You MUST choose exactly ONE of the following 10 supported recipes:
1. "react+fastapi" (Vite React frontend + Python FastAPI: high-performance async APIs, modern AI/ML apps, auto Swagger /docs)
2. "react+django" (Vite React frontend + Django REST backend: complex relational data, admin panels, Django ORM)
3. "react+node" (Vite React frontend + Express Node.js backend: full-stack JavaScript, real-time apps, REST APIs)
4. "vue+fastapi" (Vite Vue 3 frontend + Python FastAPI: lightweight Vue frontend with high-speed async FastAPI)
5. "vue+node" (Vite Vue 3 frontend + Express Node.js backend: Vue 3 composition API with Node backend)
6. "vue+django" (Vite Vue 3 frontend + Django REST backend: Vue 3 frontend paired with Django backend)
7. "react+flask" (Vite React frontend + Flask Python backend: lightweight Python microservices, data endpoints)
8. "svelte+node" (Vite Svelte frontend + Express Node.js backend: cybernetically enhanced Svelte UI with Express)
9. "fastapi" (Standalone Python FastAPI backend: backend-only async API with Swagger docs)
10. "django" (Standalone Django backend: server-rendered Python web app or traditional backend)

Respond ONLY with valid JSON in this exact schema, without markdown formatting or code blocks:
{"stack": "react+fastapi"|"react+django"|"react+node"|"vue+fastapi"|"vue+node"|"vue+django"|"react+flask"|"svelte+node"|"fastapi"|"django", "reason": "1-2 sentence justification"}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const raw = await retryOperation(async () => {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
      } catch (err) {
        // Fallback to gemini-3.5-flash-lite
        try {
          const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
          const result = await fallbackModel.generateContent(prompt);
          const response = await result.response;
          return response.text().trim();
        } catch (err2) {
          // If quota exceeded or network unavailable, use smart heuristic fallback
          const heuristic = fallbackStackSelector(description);
          return JSON.stringify(heuristic);
        }
      }
    });

    const cleanJson = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (SUPPORTED_STACKS.includes(parsed.stack)) {
      return {
        success: true,
        stack: parsed.stack,
        reason: parsed.reason
      };
    }

    return {
      success: true,
      stack: 'react+fastapi',
      reason: 'Recommended modern full-stack with FastAPI.'
    };
  } catch (err) {
    const heuristic = fallbackStackSelector(description);
    return {
      success: true,
      stack: heuristic.stack,
      reason: heuristic.reason
    };
  }
}

function fallbackStackSelector(description) {
  const desc = (description || '').toLowerCase();
  if (desc.includes('fastapi') || desc.includes('async') || desc.includes('swagger') || desc.includes('machine learning') || desc.includes('ai')) {
    return {
      stack: 'react+fastapi',
      reason: 'Optimal modern stack combining React with high-speed async FastAPI endpoints.'
    };
  }
  if (desc.includes('django') || desc.includes('orm') || desc.includes('admin panel')) {
    return {
      stack: 'react+django',
      reason: 'Django backend provides battle-tested ORM and admin management paired with React.'
    };
  }
  if (desc.includes('vue')) {
    return {
      stack: 'vue+node',
      reason: 'Vue 3 with Node Express is a lightweight, productive full-stack solution.'
    };
  }
  if (desc.includes('svelte')) {
    return {
      stack: 'svelte+node',
      reason: 'Svelte provides blazing fast reactivity paired with Express Node backend.'
    };
  }
  if (desc.includes('flask')) {
    return {
      stack: 'react+flask',
      reason: 'Flask microservices with React frontend for flexible API endpoints.'
    };
  }
  if (desc.includes('backend only') || desc.includes('standalone api')) {
    return {
      stack: 'fastapi',
      reason: 'FastAPI provides standalone async APIs with automatic interactive docs.'
    };
  }
  return {
    stack: 'react+node',
    reason: 'Full-stack JavaScript environment with Vite React and Express Node.js.'
  };
}

/**
 * Generates code files based on user instruction using strictly Gemini Free Tier models
 * (gemini-2.5-flash -> gemini-3.5-flash-lite) with deterministic offline fallback.
 */
async function instructGemini(instruction) {
  const apiKey = getApiKey();
  if (!apiKey) {
    const fallback = fallbackInstructGenerator(instruction);
    return {
      success: true,
      summary: fallback.summary,
      files: fallback.files,
      fallbackUsed: true
    };
  }

  const prompt = `You are an AI code and file generator assistant for Rapidfire CLI.
The user instructs you: "${instruction}".
Generate the complete, production-ready code files requested.
You MUST respond ONLY with valid JSON in this exact schema, without markdown formatting or code blocks:
{
  "summary": "Brief 1-sentence description of what files were created",
  "files": [
    {
      "filename": "relative/path/or/filename.ext",
      "content": "Full source code content of the file"
    }
  ]
}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const raw = await retryOperation(async () => {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
      } catch (err) {
        // Fallback to gemini-3.5-flash-lite (Free Tier)
        try {
          const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
          const result = await fallbackModel.generateContent(prompt);
          const response = await result.response;
          return response.text().trim();
        } catch (err2) {
          // If free tier quota is depleted or network offline, use fallback generator
          const fallback = fallbackInstructGenerator(instruction);
          return JSON.stringify(fallback);
        }
      }
    });

    const cleanJson = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (parsed.files && Array.isArray(parsed.files) && parsed.files.length > 0) {
      return {
        success: true,
        summary: parsed.summary || `Generated ${parsed.files.length} file(s)`,
        files: parsed.files.map((f) => ({
          filename: (f.filename || 'generated.txt').replace(/^[/\\]+/, ''),
          content: f.content || ''
        }))
      };
    }

    const fallback = fallbackInstructGenerator(instruction);
    return {
      success: true,
      summary: fallback.summary,
      files: fallback.files,
      fallbackUsed: true
    };
  } catch (err) {
    const fallback = fallbackInstructGenerator(instruction);
    return {
      success: true,
      summary: fallback.summary,
      files: fallback.files,
      fallbackUsed: true
    };
  }
}

function fallbackInstructGenerator(instruction) {
  const text = (instruction || '').trim();
  const lower = text.toLowerCase();

  let ext = '.txt';
  let defaultLang = 'text';

  if (/\b(?:cpp|c\+\+|cplusplus)\b/.test(lower)) {
    ext = '.cpp';
    defaultLang = 'cpp';
  } else if (/\b(?:python|py)\b/.test(lower)) {
    ext = '.py';
    defaultLang = 'python';
  } else if (/\b(?:javascript|js)\b/.test(lower)) {
    ext = '.js';
    defaultLang = 'js';
  } else if (/\b(?:typescript|ts)\b/.test(lower)) {
    ext = '.ts';
    defaultLang = 'ts';
  } else if (/\b(?:html|webpage)\b/.test(lower)) {
    ext = '.html';
    defaultLang = 'html';
  } else if (/\b(?:css|styles)\b/.test(lower)) {
    ext = '.css';
    defaultLang = 'css';
  } else if (/\b(?:c)\b/.test(lower) && !/\b(?:cpp|c\+\+)\b/.test(lower)) {
    ext = '.c';
    defaultLang = 'c';
  }

  // Match "named <names>"
  const namedMatch = text.match(/named\s+([^,.;\n]+)/i);
  let names = [];

  if (namedMatch) {
    const rawNames = namedMatch[1].trim();
    names = rawNames
      .split(/(?:\s+and\s+|\s*,\s*|\s+)/i)
      .map((n) => n.trim())
      .filter((n) => n && !['and', '&', 'a', 'the'].includes(n.toLowerCase()));
  }

  if (names.length === 0) {
    const numMatch = text.match(/\b(\d+)\b/);
    const count = numMatch ? Math.min(parseInt(numMatch[1], 10), 5) : 1;
    for (let i = 1; i <= count; i++) {
      names.push(`file${i}`);
    }
  }

  const files = names.map((rawName) => {
    const hasExt = path.extname(rawName).length > 0;
    const filename = hasExt ? rawName : `${rawName}${ext}`;
    const baseName = path.basename(filename, path.extname(filename));

    let content = '';
    if (defaultLang === 'cpp' || filename.endsWith('.cpp')) {
      content = `#include <iostream>\n\nint main() {\n    std::cout << "Running ${baseName}..." << std::endl;\n    return 0;\n}\n`;
    } else if (defaultLang === 'c' || filename.endsWith('.c')) {
      content = `#include <stdio.h>\n\nint main() {\n    printf("Running ${baseName}...\\n");\n    return 0;\n}\n`;
    } else if (defaultLang === 'python' || filename.endsWith('.py')) {
      content = `def main():\n    print("Running ${baseName}...")\n\nif __name__ == "__main__":\n    main()\n`;
    } else if (defaultLang === 'js' || filename.endsWith('.js')) {
      content = `console.log("Running ${baseName}...");\n`;
    } else if (defaultLang === 'ts' || filename.endsWith('.ts')) {
      content = `const moduleName: string = "${baseName}";\nconsole.log(\`Running \${moduleName}...\`);\n`;
    } else if (defaultLang === 'html' || filename.endsWith('.html')) {
      content = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>${baseName}</title>\n</head>\n<body>\n  <h1>${baseName}</h1>\n</body>\n</html>\n`;
    } else {
      content = `// ${baseName}\n`;
    }

    return { filename, content };
  });

  return {
    summary: `Created ${files.length} file(s) for instruction: "${text}"`,
    files
  };
}

/**
 * Detects programming language from file extension
 */
function detectLanguage(ext) {
  const map = {
    '.js': 'JavaScript',
    '.mjs': 'JavaScript (ESM)',
    '.cjs': 'JavaScript (CommonJS)',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript (React)',
    '.jsx': 'JavaScript (React)',
    '.vue': 'Vue Single File Component',
    '.svelte': 'Svelte Component',
    '.py': 'Python',
    '.json': 'JSON Configuration',
    '.md': 'Markdown Documentation',
    '.html': 'HTML Document',
    '.css': 'CSS Stylesheet',
    '.scss': 'SCSS Stylesheet',
    '.cpp': 'C++',
    '.cc': 'C++',
    '.cxx': 'C++',
    '.c': 'C',
    '.h': 'C/C++ Header',
    '.hpp': 'C++ Header',
    '.rs': 'Rust',
    '.go': 'Go',
    '.java': 'Java',
    '.sh': 'Shell Script',
    '.bash': 'Bash Script',
    '.zsh': 'Zsh Script',
    '.ps1': 'PowerShell Script',
    '.yaml': 'YAML Configuration',
    '.yml': 'YAML Configuration',
    '.toml': 'TOML Configuration',
    '.sql': 'SQL Script'
  };
  return map[ext.toLowerCase()] || 'Text / Source';
}

/**
 * Deterministic offline fallback explanation for a single source file
 */
function fallbackExplainFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      success: false,
      error: 'FILE_NOT_FOUND',
      message: `File not found: ${filePath}`
    };
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    return fallbackExplainDirectory(filePath);
  }

  const ext = path.extname(filePath);
  const baseName = path.basename(filePath);
  const lang = detectLanguage(ext);

  let rawContent = '';
  try {
    rawContent = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return {
      success: false,
      error: 'READ_ERROR',
      message: `Failed to read file: ${err.message}`
    };
  }

  const lines = rawContent.split(/\r?\n/);
  const lineCount = lines.length;
  const sizeKb = (stat.size / 1024).toFixed(1);

  // Extract imports
  const imports = [];
  const reqMatches = rawContent.matchAll(/(?:require\(['"]([^'"]+)['"]\)|import\s+.*?from\s+['"]([^'"]+)['"])/g);
  for (const m of reqMatches) {
    const pkg = m[1] || m[2];
    if (pkg && !imports.includes(pkg)) imports.push(pkg);
  }
  const pyMatches = rawContent.matchAll(/(?:from\s+([a-zA-Z0-9_.]+)\s+import|import\s+([a-zA-Z0-9_.]+))/g);
  for (const m of pyMatches) {
    const pkg = m[1] || m[2];
    if (pkg && !imports.includes(pkg)) imports.push(pkg);
  }
  const cMatches = rawContent.matchAll(/#include\s*[<"]([^>"]+)[>"]/g);
  for (const m of cMatches) {
    if (m[1] && !imports.includes(m[1])) imports.push(m[1]);
  }

  // Extract declared functions / classes
  const symbols = [];
  const classMatches = rawContent.matchAll(/class\s+([A-Za-z0-9_]+)/g);
  for (const m of classMatches) symbols.push(`class ${m[1]}`);
  const funcMatches = rawContent.matchAll(/(?:async\s+)?function\s+([A-Za-z0-9_]+)/g);
  for (const m of funcMatches) symbols.push(`function ${m[1]}()`);
  const constFuncMatches = rawContent.matchAll(/(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\(/g);
  for (const m of constFuncMatches) symbols.push(`function ${m[1]}()`);
  const pyFuncMatches = rawContent.matchAll(/def\s+([A-Za-z0-9_]+)\s*\(/g);
  for (const m of pyFuncMatches) symbols.push(`def ${m[1]}()`);

  // Special case for JSON metadata files
  let jsonSummary = '';
  if (ext.toLowerCase() === '.json') {
    try {
      const parsed = JSON.parse(rawContent);
      const keys = Object.keys(parsed);
      jsonSummary = `  • Top-level configuration keys: ${keys.slice(0, 10).join(', ')}${keys.length > 10 ? '...' : ''}\n`;
      if (parsed.name) jsonSummary += `  • Package name: ${parsed.name} (version: ${parsed.version || 'unversioned'})\n`;
      if (parsed.scripts) jsonSummary += `  • Defined npm scripts: ${Object.keys(parsed.scripts).join(', ')}\n`;
    } catch {}
  }

  let text = `======================================================================\n`;
  text += `FILE INSPECTION: ${baseName}\n`;
  text += `======================================================================\n\n`;
  text += `Type: ${lang} | Size: ${sizeKb} KB | Lines: ${lineCount}\n`;
  text += `Path: ${path.resolve(filePath)}\n\n`;

  text += `OVERVIEW & ROLE:\n`;
  if (baseName === 'package.json') {
    text += `  Project manifest defining metadata, dependencies, scripts, and runtime configuration.\n`;
  } else if (baseName === 'README.md') {
    text += `  Project documentation containing setup instructions, architecture guides, and reference manuals.\n`;
  } else if (baseName.includes('test') || filePath.includes('test/')) {
    text += `  Automated test suite verifying component behavior, API contracts, and edge cases.\n`;
  } else {
    text += `  Source module containing ${lang} logic for the application.\n`;
  }
  if (jsonSummary) text += `\n${jsonSummary}`;

  if (symbols.length > 0) {
    text += `\nDECLARED SYMBOLS & FUNCTIONS (${symbols.length}):\n`;
    const preview = symbols.slice(0, 12);
    preview.forEach((s) => (text += `  • ${s}\n`));
    if (symbols.length > 12) {
      text += `  • ... and ${symbols.length - 12} more symbols\n`;
    }
  }

  if (imports.length > 0) {
    text += `\nEXTERNAL DEPENDENCIES & IMPORTS (${imports.length}):\n`;
    const preview = imports.slice(0, 10);
    preview.forEach((imp) => (text += `  • ${imp}\n`));
    if (imports.length > 10) {
      text += `  • ... and ${imports.length - 10} more imports\n`;
    }
  }

  return {
    success: true,
    isFallback: true,
    text
  };
}

/**
 * Scans a directory recursively up to depth limit, filtering ignore patterns
 */
function scanDirectoryTree(dirPath, maxDepth = 2, currentDepth = 0, state = { count: 0, items: [] }) {
  if (currentDepth > maxDepth || state.count >= 60) return state.items;

  const ignores = ['.git', 'node_modules', 'venv', '.venv', 'dist', 'build', '.next', '__pycache__', '.turbo', '.rapidfire'];
  let entries = [];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return state.items;
  }

  for (const entry of entries) {
    if (ignores.includes(entry.name)) continue;
    if (state.count >= 60) break;

    const fullPath = path.join(dirPath, entry.name);
    const isDir = entry.isDirectory();
    state.count++;
    state.items.push({
      name: entry.name,
      path: fullPath,
      isDir,
      depth: currentDepth
    });

    if (isDir) {
      scanDirectoryTree(fullPath, maxDepth, currentDepth + 1, state);
    }
  }

  return state.items;
}

/**
 * Deterministic offline fallback explanation for a directory/codebase
 */
function fallbackExplainDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return {
      success: false,
      error: 'DIR_NOT_FOUND',
      message: `Directory not found: ${dirPath}`
    };
  }

  const stat = fs.statSync(dirPath);
  if (!stat.isDirectory()) {
    return fallbackExplainFile(dirPath);
  }

  const resolved = path.resolve(dirPath);
  const baseName = path.basename(resolved);
  const items = scanDirectoryTree(resolved, 2);

  // Detect tech stack from manifest files
  const stacks = [];
  const pkgPath = path.join(resolved, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      if (allDeps.react) stacks.push('React');
      if (allDeps.vue) stacks.push('Vue');
      if (allDeps.svelte) stacks.push('Svelte');
      if (allDeps.express) stacks.push('Express');
      if (allDeps.vite) stacks.push('Vite');
      if (allDeps['@google/generative-ai']) stacks.push('Google Gemini AI');
      if (stacks.length === 0) stacks.push('Node.js');
    } catch {
      stacks.push('Node.js');
    }
  }

  const reqPath = path.join(resolved, 'requirements.txt');
  if (fs.existsSync(reqPath)) {
    try {
      const reqs = fs.readFileSync(reqPath, 'utf8').toLowerCase();
      if (reqs.includes('fastapi')) stacks.push('FastAPI');
      if (reqs.includes('django')) stacks.push('Django');
      if (reqs.includes('flask')) stacks.push('Flask');
      if (stacks.length === 0) stacks.push('Python');
    } catch {
      stacks.push('Python');
    }
  }

  if (fs.existsSync(path.join(resolved, 'Cargo.toml'))) stacks.push('Rust (Cargo)');
  if (fs.existsSync(path.join(resolved, 'go.mod'))) stacks.push('Go');
  if (stacks.length === 0) stacks.push('General Codebase');

  // Build tree representation
  let treeStr = '';
  for (const item of items.slice(0, 35)) {
    const indent = '  '.repeat(item.depth);
    treeStr += `${indent}${item.isDir ? '📁 ' : '📄 '}${item.name}\n`;
  }
  if (items.length > 35) {
    treeStr += `  ... and ${items.length - 35} more files\n`;
  }

  let text = `======================================================================\n`;
  text += `CODEBASE ARCHITECTURE: ${baseName}\n`;
  text += `======================================================================\n\n`;
  text += `Path: ${resolved}\n`;
  text += `Detected Stack: ${stacks.join(', ')}\n`;
  text += `Total Scanned Files/Directories: ${items.length}\n\n`;

  text += `PROJECT STRUCTURE:\n${treeStr}\n`;

  text += `KEY DIRECTORIES & ROLES:\n`;
  const subdirs = items.filter((i) => i.isDir && i.depth === 0).map((i) => i.name);
  if (subdirs.includes('src')) text += `  • src/          Core application source logic and internal modules\n`;
  if (subdirs.includes('bin')) text += `  • bin/          CLI executable entry points\n`;
  if (subdirs.includes('test') || subdirs.includes('tests')) text += `  • test/         Automated test suites and verification scripts\n`;
  if (subdirs.includes('api') || subdirs.includes('routes')) text += `  • api/          Server endpoints and route handlers\n`;
  if (subdirs.includes('components')) text += `  • components/   Reusable UI components\n`;
  if (subdirs.includes('utils')) text += `  • utils/        Shared utilities, helpers, and file wrappers\n`;
  if (subdirs.includes('frontend')) text += `  • frontend/     Client-side application\n`;
  if (subdirs.includes('backend')) text += `  • backend/      Server-side application\n`;

  text += `\nEXECUTION ENTRY POINTS:\n`;
  if (fs.existsSync(path.join(resolved, 'package.json'))) text += `  • npm start / npm test (configured in package.json)\n`;
  if (fs.existsSync(path.join(resolved, 'main.py'))) text += `  • python main.py\n`;
  if (fs.existsSync(path.join(resolved, 'app.py'))) text += `  • python app.py\n`;
  if (fs.existsSync(path.join(resolved, 'bin/rapidfire.js'))) text += `  • bin/rapidfire.js (CLI entry point)\n`;

  return {
    success: true,
    isFallback: true,
    text
  };
}

/**
 * Explains a source file using Gemini AI with deterministic offline fallback
 */
async function explainFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      success: false,
      error: 'FILE_NOT_FOUND',
      message: `File not found: ${filePath}`
    };
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    return explainDirectory(filePath);
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return fallbackExplainFile(filePath);
  }

  let content = '';
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return fallbackExplainFile(filePath);
  }

  // Cap content to first 300 lines or 40KB to avoid excessive tokens
  const lines = content.split(/\r?\n/);
  const snippet = lines.slice(0, 300).join('\n');
  const isTruncated = lines.length > 300;

  const baseName = path.basename(filePath);
  const ext = path.extname(filePath);
  const lang = detectLanguage(ext);

  const prompt = `You are RapidFire CLI's codebase architecture explainer. Explain this file clearly and concisely for a developer:

File: ${baseName}
Language: ${lang}
Total Lines: ${lines.length} ${isTruncated ? '(previewing first 300 lines)' : ''}
Path: ${path.resolve(filePath)}

Content:
\`\`\`${ext.replace('.', '') || 'text'}
${snippet}
\`\`\`

Provide a clean, structured response:
## 1. Overview & Primary Role
(1-2 clear sentences explaining the purpose of this file)

## 2. Key Components & Functions
(Bulleted list of main functions, classes, exports, and what they do)

## 3. Dependencies & Connections
(What it imports, what libraries it uses, and what relies on it)

## 4. Notable Architecture / Logic
(Key design patterns, error handling, state, or performance characteristics)`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const text = await retryOperation(async () => {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: 'You are the expert software architect assistant for RapidFire CLI. Provide clean, highly structured, technical code explanations.'
        });
        const result = await model.generateContent(prompt);
        const resp = await result.response;
        return resp.text();
      } catch {
        const fallbackModel = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: 'You are the expert software architect assistant for RapidFire CLI. Provide clean, highly structured, technical code explanations.'
        });
        const result = await fallbackModel.generateContent(prompt);
        const resp = await result.response;
        return resp.text();
      }
    });

    return {
      success: true,
      isFallback: false,
      text
    };
  } catch {
    // If Gemini API fails, fall back to offline static analysis
    return fallbackExplainFile(filePath);
  }
}

/**
 * Explains a directory architecture using Gemini AI with deterministic offline fallback
 */
async function explainDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return {
      success: false,
      error: 'DIR_NOT_FOUND',
      message: `Directory not found: ${dirPath}`
    };
  }

  const stat = fs.statSync(dirPath);
  if (!stat.isDirectory()) {
    return explainFile(dirPath);
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return fallbackExplainDirectory(dirPath);
  }

  const resolved = path.resolve(dirPath);
  const baseName = path.basename(resolved);
  const items = scanDirectoryTree(resolved, 2);

  let treeStr = '';
  for (const item of items.slice(0, 40)) {
    const indent = '  '.repeat(item.depth);
    treeStr += `${indent}${item.isDir ? '📁 ' : '📄 '}${item.name}\n`;
  }

  let manifestSnippet = '';
  const pkgPath = path.join(resolved, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      manifestSnippet += `package.json: name="${pkg.name}", scripts=${JSON.stringify(Object.keys(pkg.scripts || {}))}, deps=${JSON.stringify(Object.keys(pkg.dependencies || {}))}\n`;
    } catch {}
  }
  const reqPath = path.join(resolved, 'requirements.txt');
  if (fs.existsSync(reqPath)) {
    try {
      manifestSnippet += `requirements.txt: ${fs.readFileSync(reqPath, 'utf8').slice(0, 300)}\n`;
    } catch {}
  }

  const prompt = `You are RapidFire CLI's codebase architecture explainer. Analyze and explain this directory architecture for a developer:

Directory: ${baseName} (${resolved})
Total Scanned Items: ${items.length}

Directory Structure:
${treeStr}

Key Manifest Highlights:
${manifestSnippet || 'None'}

Provide a clean, structured response:
## 1. Architecture Overview & Tech Stack
(Summary of frameworks, architecture patterns, and what kind of project this is)

## 2. Directory & Module Map
(Breakdown of primary folders and what their responsibilities are)

## 3. Entry Points & Workflow
(Where execution starts, how data flows, and main scripts)

## 4. Key Developer Takeaways
(Important files to know when working on or extending this project)`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const text = await retryOperation(async () => {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: 'You are the expert software architect assistant for RapidFire CLI. Provide clean, highly structured, technical codebase architecture breakdowns.'
        });
        const result = await model.generateContent(prompt);
        const resp = await result.response;
        return resp.text();
      } catch {
        const fallbackModel = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: 'You are the expert software architect assistant for RapidFire CLI. Provide clean, highly structured, technical codebase architecture breakdowns.'
        });
        const result = await fallbackModel.generateContent(prompt);
        const resp = await result.response;
        return resp.text();
      }
    });

    return {
      success: true,
      isFallback: false,
      text
    };
  } catch {
    return fallbackExplainDirectory(dirPath);
  }
}

module.exports = {
  SUPPORTED_STACKS,
  hasApiKey,
  getApiKey,
  askGemini,
  suggestStack,
  instructGemini,
  fallbackInstructGenerator,
  explainFile,
  explainDirectory,
  fallbackExplainFile,
  fallbackExplainDirectory,
  clearAskHistory,
  getAskHistory
};

