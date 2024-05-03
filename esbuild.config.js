// esbuild.config.js
// const esbuild = require('esbuild');
import esbuild from 'esbuild';
import fs from 'fs';
// const fs = require('fs');

const jsdomPatch = {
  name: 'jsdom-patch',
  setup(build) {
    build.onEnd(() => {
      const indexFile = fs.readFileSync('./dist/index.js', 'utf8');
      const corrected = indexFile.replace(/\.\/xhr-sync-worker\.js/g, 'jsdom/lib/jsdom/living/xhr/xhr-sync-worker.js');
      fs.writeFileSync('./dist/index.js', corrected);
    });
  },
};

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: "node",
  target: "node18",
  outdir: "./dist",
  format: "esm",
  tsconfig: "./tsconfig.json", // Point to your tsconfig
  plugins: [jsdomPatch],
  external: ['agentmesh', '@prisma/client', 'express'],
  // Add any other necessary options
}).catch(() => process.exit(1));

