import {rmSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const p of ['dist', 'server/dist', 'webapp/dist', 'webapp/src/manifest.ts', 'server/manifest.go']) {
    rmSync(join(ROOT, p), {recursive: true, force: true});
}
console.log('cleaned: dist/, server/dist/, webapp/dist/, generated manifests');
