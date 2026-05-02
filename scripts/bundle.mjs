// Assemble dist/<plugin_id>/ with the manifest + server binaries + webapp
// bundle + assets, then tar.gz it.
//
// Why we use the npm `tar` package instead of shelling out to `tar`: when this
// runs on Windows, NTFS does not carry a POSIX execute bit, and the system
// `tar` writes the resulting archive with mode 0o644 for the server binaries.
// Mattermost on Linux then refuses to fork/exec them ("permission denied").
// node-tar lets us set per-entry mode explicitly, so the binaries end up 0o755
// in the archive regardless of the host OS.

import {cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join, posix, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

import * as tar from 'tar';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(ROOT, 'plugin.json'), 'utf8'));
const pluginID = manifest.id;
const version = manifest.version ?? '0.1.0';

const DIST = join(ROOT, 'dist');
const STAGE = join(DIST, pluginID);
rmSync(DIST, {recursive: true, force: true});
mkdirSync(STAGE, {recursive: true});

writeFileSync(join(STAGE, 'plugin.json'), JSON.stringify({...manifest, version}, null, 4) + '\n');

const ASSETS = join(ROOT, 'assets');
if (existsSync(ASSETS)) {
    cpSync(ASSETS, join(STAGE, 'assets'), {recursive: true});
}

const SERVER_DIST = join(ROOT, 'server', 'dist');
if (existsSync(SERVER_DIST)) {
    mkdirSync(join(STAGE, 'server'), {recursive: true});
    cpSync(SERVER_DIST, join(STAGE, 'server', 'dist'), {recursive: true});
}

const WEBAPP_DIST = join(ROOT, 'webapp', 'dist');
if (existsSync(WEBAPP_DIST)) {
    mkdirSync(join(STAGE, 'webapp'), {recursive: true});
    cpSync(WEBAPP_DIST, join(STAGE, 'webapp', 'dist'), {recursive: true});
}

const bundleName = `${pluginID}-${version}.tar.gz`;
console.log(`tar → dist/${bundleName}`);

await tar.create(
    {
        gzip: true,
        cwd: DIST,
        file: join(DIST, bundleName),
        portable: true,
        prefix: '',

        // Per-entry mode override. Server binaries MUST be 0o755 or Mattermost
        // cannot exec them on Linux/macOS — see header comment for the
        // Windows-NTFS reason this is not automatic. Everything else gets 0o644
        // (regular file) or 0o755 (directory) for cleanliness.
        onWriteEntry(entry) {
            const isDir = entry.type === 'Directory';
            const isExec = entry.path.includes('/server/dist/plugin-');
            const mode = isDir || isExec ? 0o755 : 0o644;
            entry.mode = mode;
            if (entry.stat) {
                entry.stat.mode = (entry.stat.mode & ~0o777) | mode;
            }
        },
    },
    [pluginID],
);

// Sanity log: list what landed in the archive so a regression here is loud.
const entries = [];
await tar.list({
    file: join(DIST, bundleName),
    onReadEntry: (entry) => {
        if (entry.type === 'File') {
            entries.push(`${(entry.mode & 0o777).toString(8).padStart(3, '0')}  ${entry.path}`);
        }
    },
});
for (const line of entries) {
    // Normalize separators in case node-tar emitted Windows-style anywhere.
    console.log('  ' + line.split(sep).join(posix.sep));
}

console.log(`\nplugin built at: dist/${bundleName}`);
