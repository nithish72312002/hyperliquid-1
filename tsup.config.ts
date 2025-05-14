import { defineConfig } from 'tsup';

export default defineConfig([
    // React Native compatible build
    {
        entry: ['src/index.ts'],
        format: ['cjs', 'esm'],
        dts: true,
        clean: true,
        sourcemap: true,
        minify: true,
        target: 'es2020',
        platform: 'neutral', // Ensure compatibility across platforms
        treeshake: true,
        
        // Mark problematic node modules as external
        external: [
            // Node.js built-ins
            'path', 'fs', 'crypto', 'os', 'stream', 'util', 'events', 'buffer', 
            // Problematic modules with native dependencies
            'fsevents',
        ],
        
        esbuildOptions(options) {
            // React Native specific settings
            options.mainFields = ['react-native', 'browser', 'module', 'main'];
            options.conditions = ['react-native', 'import', 'require'];
            options.loader = { '.node': 'empty' };
            options.banner = {
                js: '/* hyperliquid-reactnative - MIT License */',
            };
        },
    }
]); 