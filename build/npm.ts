import { build, emptyDir } from "jsr:@deno/dnt@0.41.3";

await emptyDir("./build/npm");

await build({
    entryPoints: [
        { name: ".", path: "./mod.ts" },
        { name: "./types", path: "./src/types/mod.ts" },
        { name: "./signing", path: "./src/signing.ts" },
    ],
    outDir: "./build/npm",
    shims: {
        webSocket: true,
        crypto: true,
        abort: true
    },
    typeCheck: "false",
    test: false,
    scriptModule: "umd",
    package: {
        name: "@nktkas/hyperliquid",
        version: Deno.args[0],
        description:
            "Unofficial Hyperliquid API SDK for all major JS runtimes including React Native, written in TypeScript and provided with tests",
        keywords: [
            "api",
            "blockchain",
            "crypto",
            "cryptocurrency",
            "dex",
            "exchange",
            "hyperliquid",
            "library",
            "sdk",
            "trading",
            "typescript",
            "web3",
            "react-native",
            "mobile"
        ],
        author: {
            name: "nktkas",
            email: "github.turk9@passmail.net",
            url: "https://github.com/nktkas",
        },
        homepage: "https://github.com/nktkas/hyperliquid",
        repository: {
            type: "git",
            url: "git+https://github.com/nktkas/hyperliquid.git",
        },
        bugs: {
            url: "https://github.com/nktkas/hyperliquid/issues",
        },
        license: "MIT",
        engines: {
            node: ">=16.0.0",
        },
        peerDependencies: {
            "react-native": ">=0.63.0"
        },
    },
    importMap: "deno.json",
    compilerOptions: {
        lib: ["ES2022", "DOM"],
        jsx: "react"
    },
    postBuild() {
        Deno.copyFileSync("CONTRIBUTING.md", "build/npm/CONTRIBUTING.md");
        Deno.copyFileSync("LICENSE", "build/npm/LICENSE");
        Deno.copyFileSync("README.md", "build/npm/README.md");
        Deno.copyFileSync("SECURITY.md", "build/npm/SECURITY.md");
    },
});
