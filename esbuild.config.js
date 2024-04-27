// esbuild.config.js
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: "node",
  target: "node18",
  outdir: "./dist",
  format: "cjs",
  tsconfig: "./tsconfig.json", // Point to your tsconfig
  plugins: [],
  // Add any other necessary options
}).catch(() => process.exit(1));