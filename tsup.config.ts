import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: true,
  target: 'es2020',
  platform: 'neutral', // Ensure compatibility across platforms
  treeshake: true,
  noExternal: [], // Don't bundle any dependencies
  
  // Mark ALL node modules as external to avoid native module issues
  external: [
    // Node.js built-ins
    'path', 'fs', 'crypto', 'os', 'stream', 'util', 'events', 'buffer', 
    // Problematic modules with native dependencies
    'fsevents',
    // Any other problematic packages can be added here
  ],
  
  // Skip generating .node files entirely
  esbuildOptions(options) {
    // Ensure proper handling of dynamic imports
    options.mainFields = ['react-native', 'browser', 'module', 'main'];
    options.conditions = ['react-native', 'import', 'require'];
    
    // Specifically ignore .node files
    options.loader = { '.node': 'empty' };
    
    // Tell esbuild to use neutral platform settings
    options.platform = 'neutral';
    
    // Add license info
    options.banner = {
      js: '/* hyperliquid-reactnative - MIT License */',
    };
  },
});
