import { TypedEventTarget } from "../../utils/compatibility/event-target";
import type { BlockDetails, TxDetails } from "../../types/explorer/responses";
import type { BaseExchangeResponse } from "../../types/exchange/responses";

/** Represents a message from the Hyperliquid WebSocket API. */
interface HyperliquidMsg {
    /** Event channel name. */
    channel: string;
    /** Channel-specific data. */
    data: unknown;
}

/** Base system events and dynamic channel events for Hyperliquid WebSocket API. */
interface HyperliquidEventMap {
    /** Subscription created/removed event. */
    subscriptionResponse: CustomEvent<{
        /** Type of subscription operation. */
        method: "subscribe" | "unsubscribe";
        /** Original subscription request. */
        subscription: unknown;
    }>;

    /** Response to post request event. */
    post: CustomEvent<{
        /** Unique request identifier. */
        id: number;
        /** Server response. */
        response:
            /** Response containing requested information. */
            | {
                /** Indicates that this is an informational response. */
                type: "info";
                /** Contains the information data. */
                payload: {
                    /** Type of information being returned. */
                    type: string;
                    /** Information specific data. */
                    data: unknown;
                };
            }
            /** Response containing action result. */
            | {
                /** Indicates that this is an action response. */
                type: "action";
                /** Action result. */
                payload: BaseExchangeResponse;
            };
    }>;

    /** Error response for message event. */
    error: CustomEvent<string>;

    /** Pong response event. */
    pong: CustomEvent<undefined>;

    /** Block explorer update event. */
    _explorerBlock: CustomEvent<Omit<BlockDetails, "txs">[]>;

    /** Transaction explorer update event. */
    _explorerTxs: CustomEvent<TxDetails[]>;

    /** Subscribed channel event. */
    [key: string]: CustomEvent<unknown>;
}

/** Listens for WebSocket messages and sends them as Hyperliquid typed events. */
export class HyperliquidEventTarget extends TypedEventTarget<HyperliquidEventMap> {
    constructor(socket: WebSocket) {
        super();
        socket.addEventListener("message", (event: MessageEvent) => {
            try {
                console.log("WebSocket message received:", typeof event.data);
                
                // Handle React Native string data (some WebSocket implementations send strings directly)
                let dataStr: string;
                if (typeof event.data === 'string') {
                    dataStr = event.data;
                } else if (typeof event.data === 'object') {
                    // Handle Blob or ArrayBuffer in browser environments
                    // We'll just log this case for now since React Native typically uses strings
                    console.warn("Received non-string WebSocket data, unexpected in React Native");
                    dataStr = String(event.data);
                } else {
                    console.error("Unexpected WebSocket data type:", typeof event.data);
                    return;
                }
                
                // Try to parse the message
                try {
                    const msg = JSON.parse(dataStr) as unknown;
                    console.log("Parsed WebSocket message:", JSON.stringify(msg).substring(0, 200) + "...");
                    
                    if (isHyperliquidMsg(msg)) {
                        console.log(`Dispatching ${msg.channel} event`);
                        this.dispatchEvent(new CustomEvent(msg.channel, { detail: msg.data }));
                    } else if (isExplorerBlockMsg(msg)) {
                        console.log("Dispatching _explorerBlock event");
                        this.dispatchEvent(new CustomEvent("_explorerBlock", { detail: msg }));
                    } else if (isExplorerTxsMsg(msg)) {
                        console.log("Dispatching _explorerTxs event");
                        this.dispatchEvent(new CustomEvent("_explorerTxs", { detail: msg }));
                    } else {
                        // This is key - if we don't recognize the message format, log it
                        console.warn("Unknown message format received:", JSON.stringify(msg).substring(0, 200));
                    }
                } catch (parseError) {
                    console.error("Error parsing WebSocket message:", parseError);
                    console.error("Raw message content (first 200 chars):", dataStr.substring(0, 200));
                }
            } catch (error) {
                console.error("Critical error handling WebSocket message:", error);
            }
        });
        
        // Add error handling for the socket itself
        socket.addEventListener("error", (error) => {
            console.error("WebSocket error event:", error);
        });
    }
}

/** Type guard for Hyperliquid messages. */
function isHyperliquidMsg(value: unknown): value is HyperliquidMsg {
    return typeof value === "object" && value !== null &&
        "channel" in value && typeof value.channel === "string";
}

/** Type guard for explorer block messages. */
function isExplorerBlockMsg(value: unknown): value is Omit<BlockDetails, "txs">[] {
    return Array.isArray(value) && value.length > 0 &&
        (typeof value[0] === "object" && value[0] !== null && !Array.isArray(value[0]) &&
            "height" in value[0] && typeof value[0].height === "number" &&
            "blockTime" in value[0] && typeof value[0].blockTime === "number" &&
            "hash" in value[0] && typeof value[0].hash === "string" &&
            "proposer" in value[0] && typeof value[0].proposer === "string" &&
            "numTxs" in value[0] && typeof value[0].numTxs === "number");
}

/** Type guard for explorer transactions messages. */
function isExplorerTxsMsg(value: unknown): value is TxDetails[] {
    return Array.isArray(value) && value.length > 0 &&
        (typeof value[0] === "object" && value[0] !== null && !Array.isArray(value[0]) &&
            "action" in value[0] && typeof value[0].action === "object" && value[0].action !== null &&
            "block" in value[0] && typeof value[0].block === "number" &&
            "error" in value[0] && (typeof value[0].error === "string" || value[0].error === null) &&
            "hash" in value[0] && typeof value[0].hash === "string" &&
            "time" in value[0] && typeof value[0].time === "number" &&
            "user" in value[0] && typeof value[0].user === "string");
}
