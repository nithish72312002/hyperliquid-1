/**
 * This module contains all types related to the Hyperliquid API.
 * @example
 * ```ts
 * import type { OrderParams } from "@nktkas/hyperliquid/types";
 *
 * const myOrder: OrderParams = {
 *   a: 0, // Asset index
 *   b: true, // Buy order
 *   p: "30000", // Price
 *   s: "0.1", // Size
 *   r: false, // Not reduce-only
 *   t: {
 *     limit: {
 *       tif: "Gtc", // Good-til-cancelled
 *     },
 *   },
 * };
 * ```
 * @module
 */

export type { Hex } from "../base";

export type * from "./exchange/requests";
export type * from "./exchange/responses";

export type * from "./explorer/requests";
export type * from "./explorer/responses";

export type * from "./info/accounts";
export type * from "./info/assets";
export type * from "./info/delegations";
export type * from "./info/orders";
export type * from "./info/requests";
export type * from "./info/vaults";

export type * from "./subscriptions/responses";
export type * from "./subscriptions/requests";
