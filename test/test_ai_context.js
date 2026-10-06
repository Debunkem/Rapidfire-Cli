const assert = require('assert');
const { clearAskHistory, getAskHistory } = require('../src/ai/gemini');

console.log('--- TEST: AI CONVERSATION CONTEXT MEMORY ---');

// 1. Initial state
clearAskHistory();
assert.strictEqual(getAskHistory().length, 0, 'Ask history must be empty after clear');

// 2. Simulate conversation turns
const history = getAskHistory();
history.push({ role: 'user', parts: [{ text: 'What is the best stack for machine learning?' }] });
history.push({ role: 'model', parts: [{ text: 'React with FastAPI and Python is optimal.' }] });

assert.strictEqual(getAskHistory().length, 2, 'History must contain 2 turns');
assert.strictEqual(getAskHistory()[0].role, 'user');
assert.strictEqual(getAskHistory()[1].role, 'model');

// 3. Follow-up turn
history.push({ role: 'user', parts: [{ text: 'How do I install its dependencies?' }] });
history.push({ role: 'model', parts: [{ text: 'Run pip install fastapi uvicorn' }] });

assert.strictEqual(getAskHistory().length, 4, 'History must contain 4 turns');

// 4. Test clear
clearAskHistory();
assert.strictEqual(getAskHistory().length, 0, 'History must reset to 0 after clearAskHistory');

console.log('✓ AI conversation context memory lifecycle verified successfully.');
