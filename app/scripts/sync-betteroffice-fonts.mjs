import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dest = path.join(appRoot, 'public', 'betteroffice-fonts');

const pkgJson = require.resolve('@betteroffice/fonts/package.json');
const src = path.join(path.dirname(pkgJson), 'assets');

if (!existsSync(src)) {
  console.error(`[sync-betteroffice-fonts] missing assets at ${src}`);
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log(`[sync-betteroffice-fonts] copied → ${dest}`);
