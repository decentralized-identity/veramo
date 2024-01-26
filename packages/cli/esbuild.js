import { build } from 'esbuild';
import { rmSync, existsSync } from 'fs';
import { exec } from 'child_process';

// Building for CommonJS
build({
    entryPoints: ['src/cli.ts'], // Your entry file
    bundle: false,
    outfile: 'build/index.cjs.js', // Output file for CommonJS
    format: 'cjs', // Specify CommonJS format
    platform: 'node', // Platform target
    sourcemap: true, // Enable source maps (optional)
    target: ['node18'], // Target environment (example: Node 12)
    // additional options...
}).catch(() => process.exit(1));

// Building for ECMAScript Module
build({    
    entryPoints: ['src/**/*.ts'], // Your entry file
    bundle: false,    
    outdir: 'build', // Output file for ESM
    format: 'esm', // Specify ESM format
    sourcemap: true, // Enable source maps (optional)
    target: ['es2020'], // Target ECMAScript version
    // additional options...
}).catch(() => process.exit(1));

//delete the tsconfig.tsbuildinfo file to generate the types.
if(existsSync('tsconfig.tsbuildinfo')) {
    rmSync('tsconfig.tsbuildinfo');
}
//run the process as a child process
exec('tsc --emitDeclarationOnly', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error}`);
        return;
    }
    if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
    }    
});