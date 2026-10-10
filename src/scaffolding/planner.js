const { hasFrontendAdapter } = require('./adapters/frontend');
const { hasBackendAdapter } = require('./adapters/backend');

const PREDEFINED_RECIPES = [
  'react',
  'vue',
  'svelte',
  'fastapi',
  'django',
  'react+fastapi',
  'react+django',
  'react+node',
  'vue+fastapi',
  'vue+node',
  'vue+django',
  'react+flask',
  'svelte+node'
];

/**
 * Plans how to scaffold a requested stack string.
 * Categorizes into:
 * - 'PREDEFINED': One of the 13 built-in exact recipes
 * - 'COMPOSED': Composable combination of known frontend + backend adapters (e.g. svelte+fastapi, vue+flask)
 * - 'DYNAMIC': Unknown framework or custom stack (e.g. astro, solid, nextjs+fastapi, nestjs)
 */
function planStack(stackInput) {
  if (!stackInput || typeof stackInput !== 'string') {
    return { tier: 'INVALID', error: 'Empty stack name' };
  }

  const normalized = stackInput.toLowerCase().trim();

  // 1. Tier 1: Built-in exact recipe match
  if (PREDEFINED_RECIPES.includes(normalized)) {
    return {
      tier: 'PREDEFINED',
      stack: normalized,
      isFullstack: normalized.includes('+')
    };
  }

  // 2. Multi-framework pairing check
  if (normalized.includes('+')) {
    const parts = normalized.split('+');
    if (parts.length === 2) {
      const [fe, be] = parts;
      const feKnown = hasFrontendAdapter(fe);
      const beKnown = hasBackendAdapter(be);

      // Tier 2: Both frontend and backend have known adapters
      if (feKnown && beKnown) {
        return {
          tier: 'COMPOSED',
          stack: normalized,
          frontend: fe,
          backend: be
        };
      }

      // Tier 3: One or both are unknown
      return {
        tier: 'DYNAMIC',
        stack: normalized,
        isFullstackPairing: true,
        frontend: fe,
        backend: be,
        knownFrontend: feKnown,
        knownBackend: beKnown
      };
    }
  }

  // 3. Standalone adapter checks
  if (hasFrontendAdapter(normalized)) {
    return {
      tier: 'PREDEFINED',
      stack: normalized,
      isFullstack: false,
      type: 'standalone_frontend'
    };
  }

  if (hasBackendAdapter(normalized)) {
    return {
      tier: 'PREDEFINED',
      stack: normalized,
      isFullstack: false,
      type: 'standalone_backend'
    };
  }

  // 4. Truly unknown framework (e.g. astro, solid, nestjs, hono, qwik)
  return {
    tier: 'DYNAMIC',
    stack: normalized,
    isFullstackPairing: false
  };
}

module.exports = {
  PREDEFINED_RECIPES,
  planStack
};
