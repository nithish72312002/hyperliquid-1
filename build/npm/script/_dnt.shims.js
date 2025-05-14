var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@deno/shim-crypto", "@deno/shim-crypto", "ws", "ws"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.dntGlobalThis = exports.WebSocket = exports.crypto = void 0;
    const shim_crypto_1 = require("@deno/shim-crypto");
    var shim_crypto_2 = require("@deno/shim-crypto");
    Object.defineProperty(exports, "crypto", { enumerable: true, get: function () { return shim_crypto_2.crypto; } });
    const ws_1 = __importDefault(require("ws"));
    var ws_2 = require("ws");
    Object.defineProperty(exports, "WebSocket", { enumerable: true, get: function () { return __importDefault(ws_2).default; } });
    const dntGlobals = {
        crypto: shim_crypto_1.crypto,
        WebSocket: ws_1.default,
    };
    exports.dntGlobalThis = createMergeProxy(globalThis, dntGlobals);
    function createMergeProxy(baseObj, extObj) {
        return new Proxy(baseObj, {
            get(_target, prop, _receiver) {
                if (prop in extObj) {
                    return extObj[prop];
                }
                else {
                    return baseObj[prop];
                }
            },
            set(_target, prop, value) {
                if (prop in extObj) {
                    delete extObj[prop];
                }
                baseObj[prop] = value;
                return true;
            },
            deleteProperty(_target, prop) {
                let success = false;
                if (prop in extObj) {
                    delete extObj[prop];
                    success = true;
                }
                if (prop in baseObj) {
                    delete baseObj[prop];
                    success = true;
                }
                return success;
            },
            ownKeys(_target) {
                const baseKeys = Reflect.ownKeys(baseObj);
                const extKeys = Reflect.ownKeys(extObj);
                const extKeysSet = new Set(extKeys);
                return [...baseKeys.filter((k) => !extKeysSet.has(k)), ...extKeys];
            },
            defineProperty(_target, prop, desc) {
                if (prop in extObj) {
                    delete extObj[prop];
                }
                Reflect.defineProperty(baseObj, prop, desc);
                return true;
            },
            getOwnPropertyDescriptor(_target, prop) {
                if (prop in extObj) {
                    return Reflect.getOwnPropertyDescriptor(extObj, prop);
                }
                else {
                    return Reflect.getOwnPropertyDescriptor(baseObj, prop);
                }
            },
            has(_target, prop) {
                return prop in extObj || prop in baseObj;
            },
        });
    }
});
