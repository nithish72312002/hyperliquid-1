/**
 * Polyfill for AbortSignal.timeout() which is not available in React Native
 */

/**
 * Creates an AbortSignal that aborts after a specified time
 */
function timeoutPolyfill(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

// Check if AbortSignal.timeout exists, if not, polyfill it
if (typeof AbortSignal !== 'undefined') {
  if (!('timeout' in AbortSignal)) {
    // @ts-ignore - Adding the timeout method to AbortSignal
    AbortSignal.timeout = timeoutPolyfill;
  }
}

export {};