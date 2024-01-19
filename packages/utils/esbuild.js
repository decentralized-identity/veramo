import { build } from 'esbuild';

// Building for CommonJS
build({
    entryPoints: ['src/index.ts'], // Your entry file
    bundle: true,
    outfile: 'build/index.cjs.js', // Output file for CommonJS
    format: 'cjs', // Specify CommonJS format
    platform: 'node', // Platform target
    sourcemap: true, // Enable source maps (optional)
    target: ['node18'], // Target environment (example: Node 12)
    // additional options...
}).catch(() => process.exit(1));

// Building for ECMAScript Module
build({
    entryPoints: ['src/index.ts'], // Your entry file
    bundle: true,
    outfile: 'build/index.esm.js', // Output file for ESM
    format: 'esm', // Specify ESM format
    sourcemap: true, // Enable source maps (optional)
    target: ['es2020'], // Target ECMAScript version
    // additional options...
}).catch(() => process.exit(1));
