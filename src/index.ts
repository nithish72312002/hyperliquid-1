// Polyfills for React Native compatibility

// Add DOMException polyfill for React Native's Hermes engine
if (typeof DOMException === 'undefined') {
  // @ts-ignore - Adding DOMException to the global object
  global.DOMException = class DOMException extends Error {
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name || 'Error';
      this.message = message || '';
    }
  };
  // Add standard error names used by AbortController
  // @ts-ignore - Adding properties to the global object
  global.DOMException.ABORT_ERR = 20;
}

// @ts-ignore - Using abortcontroller-polyfill without type checks
import 'abortcontroller-polyfill/dist/abortsignal-polyfill-only';

// Base interfaces
export * from "./base";

// Signing
export type {
    AbstractEthersSigner,
    AbstractEthersV5Signer,
    AbstractExtendedViemWalletClient,
    AbstractViemWalletClient,
    AbstractWindowEthereum,
} from "./signing";

// Clients
export * from "./clients/event";
export * from "./clients/public";
export * from "./clients/wallet";

// Transports
export * from "./transports/http/http_transport";
export * from "./transports/websocket/websocket_transport";

// Types
export * from "./types/exchange/responses";
export * from "./types/explorer/responses";
export * from "./types/info/accounts";
export * from "./types/info/assets";
export * from "./types/info/delegations";
export * from "./types/info/orders";
export * from "./types/info/vaults";
export * from "./types/subscriptions/responses";
