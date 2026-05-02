// Cross-compile the server-side plugin binaries for every platform listed in
// plugin.json -> server.executables. With `--current`, only build for the host
// platform — handy for fast dev iteration when you run a Linux/macOS test
// server. Replaces the relevant chunk of the upstream Makefile so we don't
// require `make` on Windows.

import {execFileSync} from 'node:child_process';
import {mkdirSync, readFileSync, rmSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SERVER_DIR = join(ROOT, 'server');
const DIST_DIR = join(SERVER_DIR, 'dist');

const manifest = JSON.parse(readFileSync(join(ROOT, 'plugin.json'), 'utf8'));
const targets = Object.entries(manifest.server?.executables ?? {});
if (targets.length === 0) {
    console.log('No server.executables in plugin.json — skipping server build.');
    process.exit(0);
}

rmSync(DIST_DIR, {recursive: true, force: true});
mkdirSync(DIST_DIR, {recursive: true});

const onlyCurrent = process.argv.includes('--current');
const hostGoos = process.platform === 'win32' ? 'windows' : process.platform === 'darwin' ? 'darwin' : 'linux';
const hostGoarch = process.arch === 'arm64' ? 'arm64' : 'amd64';

for (const [target, outputRel] of targets) {
    const [goos, goarchRaw] = target.split('-');
    const goarch = goarchRaw;

    if (onlyCurrent && (goos !== hostGoos || goarch !== hostGoarch)) {
        continue;
    }

    const outputAbs = join(ROOT, outputRel);
    mkdirSync(dirname(outputAbs), {recursive: true});

    console.log(`go build → ${outputRel}`);
    execFileSync(
        'go',
        [
            'build',
            '-trimpath',

            // Strip the symbol table (-s) and DWARF debug info (-w). Roughly
            // 30% smaller binaries at the cost of less informative panic
            // traces (only addresses, no function names) and broken pprof
            // symbolisation. Acceptable for a tarball that ships to many
            // Mattermost servers; revert this flag if you need to debug a
            // production crash.
            '-ldflags=-s -w',

            '-o', outputAbs, '.',
        ],
        {
            cwd: SERVER_DIR,
            stdio: 'inherit',
            env: {
                ...process.env,
                CGO_ENABLED: '0',
                GOOS: goos,
                GOARCH: goarch,
            },
        },
    );
}
