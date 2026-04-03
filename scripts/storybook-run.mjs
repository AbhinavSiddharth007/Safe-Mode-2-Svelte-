import { spawn } from 'node:child_process';
import { cp, mkdtemp, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const command = process.argv[2] ?? 'build';
const extraArgs = process.argv.slice(3);
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = await mkdtemp(join(tmpdir(), 'safe-mode-storybook-'));
const tempProject = join(tempRoot, 'project');
const ignoredDirectories = new Set([
	'node_modules',
	'.svelte-kit',
	'build',
	'storybook-static',
	'playwright-report',
	'test-results'
]);

function spawnProcess(commandName, args, cwd) {
	return new Promise((resolvePromise, rejectPromise) => {
		const child = spawn(commandName, args, {
			cwd,
			env: {
				...process.env,
				HOME: tempRoot
			},
			stdio: 'inherit',
			shell: process.platform === 'win32'
		});

		child.on('error', rejectPromise);
		child.on('exit', (code) => {
			if (code === 0) {
				resolvePromise(undefined);
				return;
			}

			rejectPromise(
				new Error(`${commandName} ${args.join(' ')} failed with exit code ${code ?? 1}`)
			);
		});
	});
}

await cp(projectRoot, tempProject, {
	recursive: true,
	filter: (source) => {
		const relativePath = relative(projectRoot, source);

		if (!relativePath) {
			return true;
		}

		const [topLevelEntry] = relativePath.split('/');
		return !ignoredDirectories.has(topLevelEntry);
	}
});

await symlink(join(projectRoot, 'node_modules'), join(tempProject, 'node_modules'), 'dir');
await spawnProcess('node', ['./node_modules/.bin/svelte-kit', 'sync'], tempProject);

const storybookArgs =
	command === 'dev'
		? ['dev', '-c', '.storybook', '-p', '6006', ...extraArgs]
		: ['build', '-c', '.storybook', '-o', 'storybook-static', ...extraArgs];

try {
	await spawnProcess('node', ['./node_modules/.bin/storybook', ...storybookArgs], tempProject);

	if (command === 'build') {
		await rm(join(projectRoot, 'storybook-static'), { recursive: true, force: true });
		await cp(join(tempProject, 'storybook-static'), join(projectRoot, 'storybook-static'), {
			recursive: true
		});
	}
} finally {
	if (command === 'build') {
		await rm(tempRoot, { recursive: true, force: true });
	}
}
