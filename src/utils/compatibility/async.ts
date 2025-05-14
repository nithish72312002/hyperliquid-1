/**
 * Compatibility layer for @std/async/delay
 * Provides delay utility functions for React Native
 */

/**
 * Returns a promise that resolves after a specified delay
 * @param ms - The delay in milliseconds
 * @param options - Optional abort signal
 * @returns A promise that resolves after the specified delay
 */
export function delay(ms: number, options?: { signal?: AbortSignal }): Promise<void> {
  return new Promise((resolve, reject) => {
    if (options?.signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timer = setTimeout(resolve, ms);
    
    options?.signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });
}
