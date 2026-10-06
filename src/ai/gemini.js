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

module.exports = {
  SUPPORTED_STACKS,
  hasApiKey,
  getApiKey,
  askGemini,
  suggestStack,
  instructGemini,
  fallbackInstructGenerator,
  clearAskHistory,
  getAskHistory
};
