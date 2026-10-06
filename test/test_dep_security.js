const assert = require('assert');
const { extractDependencies, validatePackageSecurity } = require('../src/utils/depInstaller');

console.log('--- TEST: DEPENDENCY EXTRACTOR & SECURITY VALIDATOR ---');

// 1. Test extraction from AI output (mimicking the user's screenshot)
const sampleAiOutput = `
For a typical AI/ML project focusing on data analysis and machine learning:
\`\`\`bash
# Install core packages
pip install numpy pandas scikit-learn matplotlib seaborn jupyterlab

# If you need deep learning:
# pip install tensorflow
pip install Pillow opencv-python nltk
\`\`\`
`;

const extracted = extractDependencies(sampleAiOutput);
assert(extracted, 'Must detect dependencies');
assert.strictEqual(extracted.ecosystem, 'python');
console.log('Extracted packages:', extracted.packages);

assert(extracted.packages.includes('numpy'), 'Must include numpy');
assert(extracted.packages.includes('pandas'), 'Must include pandas');
assert(extracted.packages.includes('scikit-learn'), 'Must include scikit-learn');
assert(extracted.packages.includes('Pillow'), 'Must include Pillow');
assert(extracted.packages.includes('opencv-python'), 'Must include opencv-python');
console.log('✓ Dependency extraction verified.');

// 2. Test Security Validation
async function runSecurityTests() {
  // Safe packages
  const safe1 = await validatePackageSecurity('numpy', 'python');
  assert(safe1.valid, 'numpy must be valid');

  const safe2 = await validatePackageSecurity('scikit-learn', 'python');
  assert(safe2.valid, 'scikit-learn must be valid');

  // Injections and dangerous flags
  const dangerous1 = await validatePackageSecurity('numpy; rm -rf /', 'python');
  assert(!dangerous1.valid, 'Command injection must be rejected');

  const dangerous2 = await validatePackageSecurity('-e /tmp/evil', 'python');
  assert(!dangerous2.valid, 'Flag arguments must be rejected');

  const dangerous3 = await validatePackageSecurity('evil$pkg', 'python');
  assert(!dangerous3.valid, 'Shell characters must be rejected');

  const dangerous4 = await validatePackageSecurity('../../etc/passwd', 'python');
  assert(!dangerous4.valid, 'Path traversal must be rejected');

  console.log('✓ All security injection checks blocked successfully.');
}

runSecurityTests().then(() => {
  console.log('✓ All dependency extractor & security checks passed cleanly.');
});
