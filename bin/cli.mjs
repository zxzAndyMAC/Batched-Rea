#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skillName = 'batched-reverse-engineering';
const label = 'Batched Reverse Engineering';
const agentNames = { codex: 'codex', claude: 'claude-code', cursor: 'cursor', cline: 'cline', opencode: 'opencode' };

function help() {
  console.log(`${label} installer (powered by Vercel Skills CLI)\n\nUsage:\n  npx ${'batched-reverse-engineering'} install [options]\n\nOptions:\n  --global              Install to user-level skill directories\n  --local               Install to the current project (default)\n  --tool <names>        Comma-separated agent names\n  --yes                 Skip confirmation prompts\n  --copy                Copy files instead of creating skill links\n  --dry-run             Print the delegated command without changing files\n  --list                List skills available in this package\n  -h, --help            Show this help\n\nThe actual discovery, agent mapping, scope prompts, conflict handling, and output\nare provided by the official npx skills CLI.`);
}
function parse(argv) {
  const out = { selected: [], args: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === 'install') continue;
    if (value === '--global') out.args.push('--global');
    else if (value === '--local') continue;
    else if (value === '--yes') out.args.push('--yes');
    else if (value === '--copy') out.args.push('--copy');
    else if (value === '--dry-run') out.dryRun = true;
    else if (value === '--list') out.list = true;
    else if (value === '--tool') out.selected.push(...(argv[++i] ?? '').split(',').map((x) => x.trim()).filter(Boolean));
    else if (value === '-h' || value === '--help') out.help = true;
    else throw new Error(`Unknown argument: ${value}`);
  }
  return out;
}
function run(options) {
  const args = ['--yes', 'skills', 'add', root, '--skill', skillName];
  if (options.list) args.push('--list');
  if (options.args.includes('--global')) args.push('--global');
  if (options.args.includes('--yes')) args.push('--yes');
  if (options.args.includes('--copy')) args.push('--copy');
  if (options.selected.length) args.push('--agent', ...options.selected.map((name) => agentNames[name] ?? name));
  if (options.dryRun) {
    console.log('[dry-run] npx ' + ['skills', 'add', root, '--skill', skillName, ...args.slice(6)].join(' '));
    return;
  }
  const result = spawnSync('npx', args, { stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
try {
  const options = parse(process.argv.slice(2));
  if (options.help || (!process.argv.slice(2).includes('install') && !options.list)) { help(); process.exit(0); }
  run(options);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
