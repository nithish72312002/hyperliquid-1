/**
 * Environment detection and platform-specific utilities
 */

// Define a safer way to check for Node.js environment
const checkIsNode = (): boolean => {
    return typeof process !== 'undefined' && 
           typeof process.versions !== 'undefined' && 
           typeof process.versions.node !== 'undefined';
};

// Define a safer way to check for React Native environment
const checkIsReactNative = (): boolean => {
    // Check for React Native via navigator.userAgent
    const hasReactNativeUserAgent = typeof navigator !== 'undefined' && 
                                  typeof navigator.userAgent === 'string' && 
                                  navigator.userAgent.indexOf('ReactNative') >= 0;

    // Check for React Native via global
    const hasReactNativeGlobal = typeof globalThis !== 'undefined' && 
                               ((globalThis as any).navigator?.product === 'ReactNative' ||
                                (globalThis as any).hasOwnProperty?.('__REACT_NATIVE_DEBUGGER__'));
                                
    return hasReactNativeUserAgent || hasReactNativeGlobal;
};

export const environment = {
    isBrowser: typeof window !== 'undefined' && typeof document !== 'undefined',
    isNode: checkIsNode(),
    isReactNative: checkIsReactNative(),
    isWebWorker: typeof self === 'object' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope',
    
    // Helper methods
    hasNativeWebSocket(): boolean {
        if (this.isReactNative) {
            return true; // React Native has native WebSocket support
        }
        
        if (this.isBrowser) {
            return typeof WebSocket !== 'undefined';
        }
        
        if (this.isNode) {
            return typeof (globalThis as any).WebSocket !== 'undefined';
        }
        
        return false;
    },

    supportsWebSocket(): boolean {
        // React Native has built-in WebSocket support
        if (this.isReactNative) {
            return true;
        }
        
        // First check for native support
        if (this.hasNativeWebSocket()) {
            return true;
        }

        // For Node.js without native support, try to load ws package
        if (this.isNode) {
            try {
                // Dynamic require to avoid bundling ws package in browser builds
                const WebSocket = (globalThis as any).require?.('ws');
                return typeof WebSocket === 'function';
            } catch {
                return false;
            }
        }

        return false;
    },
    
    getGlobalObject(): any {
        if (this.isBrowser) return window;
        if (this.isReactNative) return globalThis;
        if (this.isWebWorker) return self;
        if (this.isNode) return globalThis;
        return globalThis;
    }
};
