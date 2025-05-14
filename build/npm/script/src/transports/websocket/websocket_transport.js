var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../_dnt.shims.js", "./_reconnecting_websocket.js", "./_hyperliquid_event_target.js", "./_websocket_request_dispatcher.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebSocketTransport = exports.ReconnectingWebSocketError = exports.WebSocketRequestError = void 0;
    const dntShim = __importStar(require("../../../_dnt.shims.js"));
    const _reconnecting_websocket_js_1 = require("./_reconnecting_websocket.js");
    Object.defineProperty(exports, "ReconnectingWebSocketError", { enumerable: true, get: function () { return _reconnecting_websocket_js_1.ReconnectingWebSocketError; } });
    const _hyperliquid_event_target_js_1 = require("./_hyperliquid_event_target.js");
    const _websocket_request_dispatcher_js_1 = require("./_websocket_request_dispatcher.js");
    Object.defineProperty(exports, "WebSocketRequestError", { enumerable: true, get: function () { return _websocket_request_dispatcher_js_1.WebSocketRequestError; } });
    /** WebSocket implementation of the REST and Subscription transport interfaces. */
    class WebSocketTransport {
        /**
         * Creates a new WebSocket transport instance.
         * @param options - Configuration options for the WebSocket transport layer.
         */
        constructor(options) {
            /** The interval timer ID for keep-alive messages. */
            Object.defineProperty(this, "_keepAliveTimer", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: null
            });
            /** The WebSocket request dispatcher instance. */
            Object.defineProperty(this, "_wsRequester", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /** The Hyperliquid event target instance. */
            Object.defineProperty(this, "_hlEvents", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /**
             * Map of active subscriptions.
             * - Key: Unique subscription identifier based on payload
             * - Value: Subscription info containing the subscription request promise
             *   and a map of listeners to their metadata (channel + unsubscribe function).
             */
            Object.defineProperty(this, "_subscriptions", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: new Map()
            });
            /**
             * Request timeout in ms.
             * Set to `null` to disable.
             */
            Object.defineProperty(this, "timeout", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /** Keep-alive configuration settings. */
            Object.defineProperty(this, "keepAlive", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /** The WebSocket that is used for communication. */
            Object.defineProperty(this, "socket", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            this.socket = new _reconnecting_websocket_js_1.ReconnectingWebSocket(options?.url ?? "wss://api.hyperliquid.xyz/ws", undefined, options?.reconnect);
            this._hlEvents = new _hyperliquid_event_target_js_1.HyperliquidEventTarget(this.socket);
            this._wsRequester = new _websocket_request_dispatcher_js_1.WebSocketRequestDispatcher(this.socket, this._hlEvents);
            this.timeout = options?.timeout === undefined ? 10_000 : options.timeout;
            this.keepAlive = {
                interval: options?.keepAlive?.interval === undefined ? 20_000 : options.keepAlive.interval,
            };
            // Initialize listeners
            this.socket.addEventListener("open", () => {
                // Start keep-alive timer
                if (this.keepAlive.interval && this._keepAliveTimer === null) {
                    this._keepAliveTimer = setInterval(() => {
                        this.socket.send(JSON.stringify({ method: "ping" }));
                    }, this.keepAlive.interval);
                }
            });
            this.socket.addEventListener("close", () => {
                // Clear keep-alive timer
                if (this._keepAliveTimer !== null) {
                    clearInterval(this._keepAliveTimer);
                    this._keepAliveTimer = null;
                }
                // Clear all subscriptions
                for (const subscriptionInfo of this._subscriptions.values()) {
                    for (const [_, unsubscribe] of subscriptionInfo.listeners) {
                        unsubscribe();
                    }
                }
            });
        }
        /**
         * Sends a request to the Hyperliquid API via WebSocket.
         * @param endpoint - The API endpoint to send the request to (`explorer` requests are not supported).
         * @param payload - The payload to send with the request.
         * @param signal - An optional abort signal.
         * @returns A promise that resolves with parsed JSON response body.
         * @throws {WebSocketRequestError} - An error that occurs when a WebSocket request fails.
         * @note Explorer requests are not supported in the Hyperliquid WebSocket API.
         */
        request(type, payload, signal) {
            // Send the request and wait for a response
            const timeoutSignal = this.timeout ? AbortSignal.timeout(this.timeout) : undefined;
            const combinedSignal = signal && timeoutSignal
                ? AbortSignal.any([signal, timeoutSignal])
                : signal ?? timeoutSignal;
            return this._wsRequester.request("post", {
                type: type === "exchange" ? "action" : type,
                payload,
            }, combinedSignal);
        }
        /**
         * Subscribes to a Hyperliquid event channel.
         * @param channel - The event channel to listen to.
         * @param payload - A payload to send with the subscription request.
         * @param listener - A function to call when the event is dispatched.
         * @param signal - An optional abort signal for canceling the subscription request.
         * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
         */
        async subscribe(channel, payload, listener, signal) {
            // Create a unique identifier for the subscription
            const id = _websocket_request_dispatcher_js_1.WebSocketRequestDispatcher.requestToId(payload);
            // Initialize new subscription, if it doesn't exist
            let subscription = this._subscriptions.get(id);
            if (!subscription) {
                // Send subscription request
                const timeoutSignal = this.timeout ? AbortSignal.timeout(this.timeout) : undefined;
                const combinedSignal = signal && timeoutSignal
                    ? AbortSignal.any([signal, timeoutSignal])
                    : signal ?? timeoutSignal;
                const requestPromise = this._wsRequester.request("subscribe", payload, combinedSignal);
                // Cache subscription info
                subscription = { listeners: new Map(), requestPromise };
                this._subscriptions.set(id, subscription);
            }
            // Initialize new listener, if it doesn't exist
            let unsubscribe = subscription.listeners.get(listener);
            if (!unsubscribe) {
                // Create new unsubscribe function
                unsubscribe = async (signal) => {
                    // Remove listener and cleanup
                    this._hlEvents.removeEventListener(channel, listener);
                    const subscription = this._subscriptions.get(id);
                    subscription?.listeners.delete(listener);
                    // If no listeners remain, remove subscription entirely
                    if (subscription?.listeners.size === 0) {
                        // Cleanup subscription
                        this._subscriptions.delete(id);
                        // If the socket is open, send unsubscription request
                        if (this.socket.readyState === dntShim.WebSocket.OPEN) {
                            const timeoutSignal = this.timeout ? AbortSignal.timeout(this.timeout) : undefined;
                            const combinedSignal = signal && timeoutSignal
                                ? AbortSignal.any([signal, timeoutSignal])
                                : signal ?? timeoutSignal;
                            await this._wsRequester.request("unsubscribe", payload, combinedSignal);
                        }
                    }
                };
                // Add listener and cache unsubscribe function
                this._hlEvents.addEventListener(channel, listener);
                subscription.listeners.set(listener, unsubscribe);
            }
            // Wait for the initial subscription request to complete
            await subscription.requestPromise.catch((error) => {
                // Remove listener and cleanup
                this._hlEvents.removeEventListener(channel, listener);
                const subscription = this._subscriptions.get(id);
                subscription?.listeners.delete(listener);
                // If no listeners remain, remove subscription entirely
                if (subscription?.listeners.size === 0) {
                    this._subscriptions.delete(id);
                }
                // Rethrow the error
                throw error;
            });
            // Return subscription control object
            return { unsubscribe };
        }
        /**
         * Waits until the WebSocket connection is ready.
         * @param signal - An optional abort signal.
         * @returns A promise that resolves when the connection is ready.
         */
        ready(signal) {
            return new Promise((resolve, reject) => {
                const combinedSignal = signal
                    ? AbortSignal.any([this.socket.terminationSignal, signal])
                    : this.socket.terminationSignal;
                if (combinedSignal.aborted)
                    return reject(combinedSignal.reason);
                if (this.socket.readyState === dntShim.WebSocket.OPEN)
                    return resolve();
                const handleOpen = () => {
                    combinedSignal.removeEventListener("abort", handleAbort);
                    resolve();
                };
                const handleAbort = () => {
                    this.socket.removeEventListener("open", handleOpen);
                    reject(combinedSignal.reason);
                };
                this.socket.addEventListener("open", handleOpen, { once: true });
                combinedSignal.addEventListener("abort", handleAbort, { once: true });
            });
        }
        /**
         * Closes the WebSocket connection and waits until it is fully closed.
         * @param signal - An optional abort signal.
         * @returns A promise that resolves when the connection is fully closed.
         */
        close(signal) {
            return new Promise((resolve, reject) => {
                if (signal?.aborted)
                    return reject(signal.reason);
                if (this.socket.readyState === dntShim.WebSocket.CLOSED)
                    return resolve();
                const handleClose = () => {
                    signal?.removeEventListener("abort", handleAbort);
                    resolve();
                };
                const handleAbort = () => {
                    this.socket.removeEventListener("close", handleClose);
                    reject(signal?.reason);
                };
                this.socket.addEventListener("close", handleClose, { once: true });
                signal?.addEventListener("abort", handleAbort, { once: true });
                this.socket.close();
            });
        }
    }
    exports.WebSocketTransport = WebSocketTransport;
});
