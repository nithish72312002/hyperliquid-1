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
        define(["require", "exports", "../../../_dnt.shims.js", "../../base.js", "../../../deps/jsr.io/@std/async/1.0.13/delay.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReconnectingWebSocket = exports.ReconnectingWebSocketError = void 0;
    // deno-lint-ignore-file no-explicit-any
    const dntShim = __importStar(require("../../../_dnt.shims.js"));
    const base_js_1 = require("../../base.js");
    const delay_js_1 = require("../../../deps/jsr.io/@std/async/1.0.13/delay.js");
    /** Simple FIFO (First In, First Out) buffer implementation. */
    class FIFOMessageBuffer {
        constructor() {
            Object.defineProperty(this, "messages", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: []
            });
        }
        push(data) {
            this.messages.push(data);
        }
        shift() {
            return this.messages.shift();
        }
        clear() {
            this.messages = [];
        }
    }
    /** Error thrown when reconnection problems occur. */
    class ReconnectingWebSocketError extends base_js_1.TransportError {
        constructor(code, originalError) {
            super(`Error when reconnecting WebSocket: ${code}`);
            Object.defineProperty(this, "code", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: code
            });
            Object.defineProperty(this, "originalError", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: originalError
            });
            this.name = "ReconnectingWebSocketError";
        }
    }
    exports.ReconnectingWebSocketError = ReconnectingWebSocketError;
    /**
     * A WebSocket that automatically reconnects when disconnected.
     * Fully compatible with standard WebSocket API.
     */
    class ReconnectingWebSocket {
        /**
         * Creates a new reconnecting WebSocket.
         * @param url - The WebSocket URL to connect to.
         * @param protocols - The WebSocket protocols to use.
         * @param options - The configuration options.
         */
        constructor(url, protocols, options) {
            /** Controller for handling connection termination. */
            Object.defineProperty(this, "_terminationController", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: new AbortController()
            });
            /** WebSocket protocols defined in constructor. */
            Object.defineProperty(this, "_protocols", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /** Non-permanent original instance of WebSocket. */
            Object.defineProperty(this, "_socket", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /** Current number of reconnection attempts */
            Object.defineProperty(this, "_reconnectCount", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            /** The array of registered event listeners to recover from reconnection. */
            Object.defineProperty(this, "_eventListeners", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: []
            });
            /** WebSocket event handlers for reconnection. */
            Object.defineProperty(this, "_onclose", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /** WebSocket event handlers for reconnection. */
            Object.defineProperty(this, "_onerror", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /** WebSocket event handlers for reconnection. */
            Object.defineProperty(this, "_onmessage", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /** WebSocket event handlers for reconnection. */
            Object.defineProperty(this, "_onopen", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /** Configuration options for WebSocket reconnection. */
            Object.defineProperty(this, "reconnectOptions", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            /** The signal that is aborted when the connection is permanently closed. */
            Object.defineProperty(this, "terminationSignal", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: this._terminationController.signal
            });
            Object.defineProperty(this, "CLOSED", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: dntShim.WebSocket.CLOSED
            });
            Object.defineProperty(this, "CLOSING", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: dntShim.WebSocket.CLOSING
            });
            Object.defineProperty(this, "CONNECTING", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: dntShim.WebSocket.CONNECTING
            });
            Object.defineProperty(this, "OPEN", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: dntShim.WebSocket.OPEN
            });
            // Set the default options
            this.reconnectOptions = {
                maxRetries: options?.maxRetries ?? 3,
                connectionTimeout: options?.connectionTimeout === undefined ? 10_000 : options.connectionTimeout,
                connectionDelay: options?.connectionDelay ?? ((attempt) => Math.min(~~(1 << attempt) * 150, 10_000)),
                shouldReconnect: options?.shouldReconnect ?? (() => true),
                messageBuffer: options?.messageBuffer ?? new FIFOMessageBuffer(),
            };
            this._protocols = protocols;
            // Create the WebSocket instance
            this._socket = createWebSocketWithTimeout(url, this._protocols, this.reconnectOptions.connectionTimeout);
            // Initialize the reconnection event listeners
            this._initEventListeners();
            // Store the original event listeners for reconnection
            this._onclose = this._socket.onclose;
            this._onerror = this._socket.onerror;
            this._onmessage = this._socket.onmessage;
            this._onopen = this._socket.onopen;
        }
        /** Initializes the internal event listeners for the WebSocket. */
        _initEventListeners() {
            this._socket.addEventListener("open", () => {
                // Send all buffered messages
                let message;
                while ((message = this.reconnectOptions.messageBuffer.shift()) !== undefined) {
                    this._socket.send(message);
                }
            }, { once: true });
            this._socket.addEventListener("close", async (event) => {
                try {
                    // If the termination signal is already aborted, do not attempt to reconnect
                    if (this._terminationController.signal.aborted)
                        return;
                    // Check if reconnection should be attempted
                    if (++this._reconnectCount > this.reconnectOptions.maxRetries) {
                        this._cleanup(new ReconnectingWebSocketError("RECONNECTION_LIMIT_REACHED"));
                        return;
                    }
                    const userDecision = await this.reconnectOptions.shouldReconnect(event);
                    if (this._terminationController.signal.aborted)
                        return; // Check again after the await
                    if (!userDecision) {
                        this._cleanup(new ReconnectingWebSocketError("RECONNECTION_STOPPED_BY_USER"));
                        return;
                    }
                    // Delay before reconnecting
                    const delayTime = typeof this.reconnectOptions.connectionDelay === "number"
                        ? this.reconnectOptions.connectionDelay
                        : await this.reconnectOptions.connectionDelay(this._reconnectCount);
                    if (this._terminationController.signal.aborted)
                        return; // Check again after the await
                    await (0, delay_js_1.delay)(delayTime, { signal: this._terminationController.signal });
                    // Create a new WebSocket instance
                    this._socket = createWebSocketWithTimeout(this.url, this._protocols, this.reconnectOptions.connectionTimeout);
                    // Reconnect all listeners
                    this._initEventListeners();
                    this._eventListeners.forEach(({ type, listenerProxy, options }) => {
                        this._socket.addEventListener(type, listenerProxy, options);
                    });
                    this._socket.onclose = this._onclose;
                    this._socket.onerror = this._onerror;
                    this._socket.onmessage = this._onmessage;
                    this._socket.onopen = this._onopen;
                }
                catch (error) {
                    this._cleanup(new ReconnectingWebSocketError("UNKNOWN_ERROR", error));
                }
            }, { once: true });
        }
        /**
         * Clean up internal resources.
         * @param reason - The reason for cleanup.
         */
        _cleanup(reason) {
            this._terminationController.abort(reason);
            this.reconnectOptions.messageBuffer.clear();
            this._eventListeners = [];
            this._socket.dispatchEvent(new CustomEvent("error", { detail: reason }));
        }
        // WebSocket property implementations
        get url() {
            return this._socket.url;
        }
        get readyState() {
            return this._socket.readyState;
        }
        get bufferedAmount() {
            return this._socket.bufferedAmount;
        }
        get extensions() {
            return this._socket.extensions;
        }
        get protocol() {
            return this._socket.protocol;
        }
        get binaryType() {
            return this._socket.binaryType;
        }
        set binaryType(value) {
            this._socket.binaryType = value;
        }
        get onclose() {
            return this._socket.onclose;
        }
        set onclose(value) {
            this._socket.onclose = value;
            this._onclose = value; // Store the listener for reconnection
        }
        get onerror() {
            return this._socket.onerror;
        }
        set onerror(value) {
            this._socket.onerror = value;
            this._onerror = value; // Store the listener for reconnection
        }
        get onmessage() {
            return this._socket.onmessage;
        }
        set onmessage(value) {
            this._socket.onmessage = value;
            this._onmessage = value; // Store the listener for reconnection
        }
        get onopen() {
            return this._socket.onopen;
        }
        set onopen(value) {
            this._socket.onopen = value;
            this._onopen = value; // Store the listener for reconnection
        }
        /**
         * @param permanently - If `true`, the connection will be permanently closed. Default is `true`.
         */
        close(code, reason, permanently = true) {
            this._socket.close(code, reason);
            if (permanently) {
                this._cleanup(new ReconnectingWebSocketError("USER_INITIATED_CLOSE"));
            }
        }
        /**
         * @note If the connection is not open, the data will be buffered and sent when the connection is established.
         */
        send(data) {
            if (this._socket.readyState !== dntShim.WebSocket.OPEN && !this._terminationController.signal.aborted) {
                this.reconnectOptions.messageBuffer.push(data);
            }
            else {
                this._socket.send(data);
            }
        }
        addEventListener(type, listener, options) {
            // Wrap the listener to handle reconnection
            let listenerProxy;
            if (this._terminationController.signal.aborted) {
                // If the connection is permanently closed, use the original listener
                listenerProxy = listener;
            }
            else {
                // Check if the listener is already registered
                const index = this._eventListeners.findIndex((e) => listenersMatch(e, { type, listener, options }));
                if (index !== -1) {
                    // Use the existing listener proxy
                    listenerProxy = this._eventListeners[index].listenerProxy;
                }
                else {
                    // Wrap the original listener to follow the once option when reconnecting
                    listenerProxy = (event) => {
                        try {
                            if (typeof listener === "function") {
                                listener.call(this, event);
                            }
                            else {
                                listener.handleEvent(event);
                            }
                        }
                        finally {
                            if (typeof options === "object" && options.once === true) {
                                const index = this._eventListeners.findIndex((e) => listenersMatch(e, { type, listener, options }));
                                if (index !== -1) {
                                    this._eventListeners.splice(index, 1);
                                }
                            }
                        }
                    };
                    this._eventListeners.push({ type, listener, options, listenerProxy });
                }
            }
            // Add the wrapped (or original) listener
            this._socket.addEventListener(type, listenerProxy, options);
        }
        removeEventListener(type, listener, options) {
            // Remove a wrapped listener, not an original listener
            const index = this._eventListeners.findIndex((e) => listenersMatch(e, { type, listener, options }));
            if (index !== -1) {
                const { listenerProxy } = this._eventListeners[index];
                this._socket.removeEventListener(type, listenerProxy, options);
                this._eventListeners.splice(index, 1);
            }
            else {
                // If the wrapped listener is not found, remove the original listener
                this._socket.removeEventListener(type, listener, options);
            }
        }
        dispatchEvent(event) {
            return this._socket.dispatchEvent(event);
        }
    }
    exports.ReconnectingWebSocket = ReconnectingWebSocket;
    Object.defineProperty(ReconnectingWebSocket, "CLOSED", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: dntShim.WebSocket.CLOSED
    });
    Object.defineProperty(ReconnectingWebSocket, "CLOSING", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: dntShim.WebSocket.CLOSING
    });
    Object.defineProperty(ReconnectingWebSocket, "CONNECTING", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: dntShim.WebSocket.CONNECTING
    });
    Object.defineProperty(ReconnectingWebSocket, "OPEN", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: dntShim.WebSocket.OPEN
    });
    /** Creates a WebSocket with connection timeout. */
    function createWebSocketWithTimeout(url, protocols, timeout) {
        // Ensure URL is a string (needed for React Native)
        const urlString = url.toString();
        // Create WebSocket - works in all environments (browser, Node.js, React Native)
        const socket = new dntShim.WebSocket(urlString, protocols);
        if (timeout === null || timeout === undefined)
            return socket;
        const timeoutId = setTimeout(() => {
            socket.removeEventListener("open", openHandler);
            socket.removeEventListener("close", closeHandler);
            socket.close(3008, "Timeout"); // https://www.iana.org/assignments/websocket/websocket.xml#close-code-number
        }, timeout);
        const openHandler = () => {
            socket.removeEventListener("close", closeHandler);
            clearTimeout(timeoutId);
        };
        const closeHandler = () => {
            socket.removeEventListener("open", openHandler);
            clearTimeout(timeoutId);
        };
        socket.addEventListener("open", openHandler, { once: true });
        socket.addEventListener("close", closeHandler, { once: true });
        return socket;
    }
    /** Check if two event listeners are the same (just like EventTarget). */
    function listenersMatch(a, b) {
        // EventTarget only compares capture in options, even if one is an object and the other is boolean
        const aCapture = Boolean(typeof a.options === "object" ? a.options.capture : a.options);
        const bCapture = Boolean(typeof b.options === "object" ? b.options.capture : b.options);
        return a.type === b.type && a.listener === b.listener && aCapture === bCapture;
    }
});
