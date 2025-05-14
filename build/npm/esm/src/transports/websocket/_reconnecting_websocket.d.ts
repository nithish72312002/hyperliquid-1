import * as dntShim from "../../../_dnt.shims.js";
import { type MaybePromise, TransportError } from "../../base.js";
/** Configuration options for the `ReconnectingWebSocket`. */
export interface ReconnectingWebSocketOptions {
    /**
     * Maximum number of reconnection attempts.
     * @defaultValue `3`
     */
    maxRetries?: number;
    /**
     * Maximum time in ms to wait for a connection to open.
     * Set to `null` to disable.
     * @defaultValue `10_000`
     */
    connectionTimeout?: number | null;
    /**
     * Delay between reconnection attempts in ms.
     * May be a number or a function that returns a number.
     * @param attempt - The current attempt number.
     * @defaultValue `(attempt) => Math.min(~~(1 << attempt) * 150, 10_000)` - Exponential backoff (max 10s)
     */
    connectionDelay?: number | ((attempt: number) => MaybePromise<number>);
    /**
     * Custom logic to determine if reconnection is required.
     * @param event - The close event that occurred during the connection.
     * @returns A boolean indicating if reconnection should be attempted.
     * @defaultValue `() => true` - Always reconnect
     */
    shouldReconnect?: (event: CloseEvent) => MaybePromise<boolean>;
    /**
     * Message buffering strategy between reconnection attempts.
     * @defaultValue `new FIFOMessageBuffer()`
     */
    messageBuffer?: MessageBufferStrategy;
}
/** Message buffer strategy interface. */
export interface MessageBufferStrategy {
    /** Array of buffered messages. */
    messages: (string | ArrayBufferLike | Blob | ArrayBufferView)[];
    /**
     * Add a message to the buffer.
     * @param data - The message to buffer.
     */
    push(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
    /**
     * Get and remove the next message from the buffer.
     * @returns The next message or `undefined` if no more messages are available.
     */
    shift(): (string | ArrayBufferLike | Blob | ArrayBufferView) | undefined;
    /** Clear all buffered messages. */
    clear(): void;
}
/** Error thrown when reconnection problems occur. */
export declare class ReconnectingWebSocketError extends TransportError {
    code: "RECONNECTION_LIMIT_REACHED" | "RECONNECTION_STOPPED_BY_USER" | "USER_INITIATED_CLOSE" | "UNKNOWN_ERROR";
    originalError?: unknown | undefined;
    constructor(code: "RECONNECTION_LIMIT_REACHED" | "RECONNECTION_STOPPED_BY_USER" | "USER_INITIATED_CLOSE" | "UNKNOWN_ERROR", originalError?: unknown | undefined);
}
/**
 * A WebSocket that automatically reconnects when disconnected.
 * Fully compatible with standard WebSocket API.
 */
export declare class ReconnectingWebSocket implements dntShim.WebSocket {
    /** Controller for handling connection termination. */
    private _terminationController;
    /** WebSocket protocols defined in constructor. */
    private _protocols?;
    /** Non-permanent original instance of WebSocket. */
    private _socket;
    /** Current number of reconnection attempts */
    protected _reconnectCount: number;
    /** The array of registered event listeners to recover from reconnection. */
    private _eventListeners;
    /** WebSocket event handlers for reconnection. */
    private _onclose;
    /** WebSocket event handlers for reconnection. */
    private _onerror;
    /** WebSocket event handlers for reconnection. */
    private _onmessage;
    /** WebSocket event handlers for reconnection. */
    private _onopen;
    /** Configuration options for WebSocket reconnection. */
    reconnectOptions: Required<ReconnectingWebSocketOptions>;
    /** The signal that is aborted when the connection is permanently closed. */
    terminationSignal: AbortSignal;
    /**
     * Creates a new reconnecting WebSocket.
     * @param url - The WebSocket URL to connect to.
     * @param protocols - The WebSocket protocols to use.
     * @param options - The configuration options.
     */
    constructor(url: string | URL, protocols?: string | string[], options?: ReconnectingWebSocketOptions);
    /** Initializes the internal event listeners for the WebSocket. */
    private _initEventListeners;
    /**
     * Clean up internal resources.
     * @param reason - The reason for cleanup.
     */
    private _cleanup;
    get url(): string;
    get readyState(): number;
    get bufferedAmount(): number;
    get extensions(): string;
    get protocol(): string;
    get binaryType(): BinaryType;
    set binaryType(value: BinaryType);
    readonly CLOSED: any;
    readonly CLOSING: any;
    readonly CONNECTING: any;
    readonly OPEN: any;
    static readonly CLOSED: any;
    static readonly CLOSING: any;
    static readonly CONNECTING: any;
    static readonly OPEN: any;
    get onclose(): ((this: dntShim.WebSocket, ev: CloseEvent) => any) | null;
    set onclose(value: ((this: dntShim.WebSocket, ev: CloseEvent) => any) | null);
    get onerror(): ((this: dntShim.WebSocket, ev: Event) => any) | null;
    set onerror(value: ((this: dntShim.WebSocket, ev: Event) => any) | null);
    get onmessage(): ((this: dntShim.WebSocket, ev: MessageEvent<any>) => any) | null;
    set onmessage(value: ((this: dntShim.WebSocket, ev: MessageEvent<any>) => any) | null);
    get onopen(): ((this: dntShim.WebSocket, ev: Event) => any) | null;
    set onopen(value: ((this: dntShim.WebSocket, ev: Event) => any) | null);
    /**
     * @param permanently - If `true`, the connection will be permanently closed. Default is `true`.
     */
    close(code?: number, reason?: string, permanently?: boolean): void;
    /**
     * @note If the connection is not open, the data will be buffered and sent when the connection is established.
     */
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
    addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: ((this: ReconnectingWebSocket, ev: WebSocketEventMap[K]) => any) | {
        handleEvent: (event: WebSocketEventMap[K]) => any;
    }, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof WebSocketEventMap>(type: K, listener: ((this: ReconnectingWebSocket, ev: WebSocketEventMap[K]) => any) | {
        handleEvent: (event: WebSocketEventMap[K]) => any;
    }, options?: boolean | EventListenerOptions): void;
    dispatchEvent(event: Event): boolean;
}
//# sourceMappingURL=_reconnecting_websocket.d.ts.map