/**
 * Polyfills for AbortSignal methods which are not available in React Native
 */

/**
 * Creates an AbortSignal that aborts after a specified time
 */
function timeoutPolyfill(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

/**
 * Creates an AbortSignal that aborts when any of the given signals abort
 */
function anyPolyfill(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  
  // Check if any signal is already aborted, abort immediately
  for (const signal of signals) {
    if (signal && signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
  }
  
  // For signals that support addEventListener, use it
  const cleanup = () => {
    for (const signal of signals) {
      if (signal && typeof signal.removeEventListener === 'function') {
        try {
          signal.removeEventListener('abort', abortHandler);
        } catch (e) {
          // Ignore errors when removing event listeners
        }
      }
    }
    clearInterval(intervalId);
  };
  
  const abortHandler = () => {
    for (const signal of signals) {
      if (signal && signal.aborted) {
        controller.abort(signal.reason);
        cleanup();
        return;
      }
    }
  };
  
  // Try to add event listeners if possible
  for (const signal of signals) {
    if (signal && typeof signal.addEventListener === 'function') {
      try {
        signal.addEventListener('abort', abortHandler);
      } catch (e) {
        // If addEventListener fails, we'll rely on polling
      }
    }
  }
  
  // Also use polling as a backup approach
  const intervalId = setInterval(abortHandler, 100);
  
  // Ensure cleanup when controller is aborted
  controller.signal.addEventListener('abort', cleanup, { once: true });
  
  return controller.signal;
}

// Add polyfills if needed
if (typeof AbortSignal !== 'undefined') {
  // Add timeout() polyfill if needed
  if (!('timeout' in AbortSignal)) {
    // @ts-ignore - Adding the timeout method to AbortSignal
    AbortSignal.timeout = timeoutPolyfill;
  }
  
  // Add any() polyfill if needed
  if (!('any' in AbortSignal)) {
    // @ts-ignore - Adding the any method to AbortSignal
    AbortSignal.any = anyPolyfill;
  }
}

export {};