#!/usr/bin/env node

import { existsSync, mkdirSync, cpSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const skillName = 'batched-reverse-engineering';

const tools = {
  codex: {
    label: 'Codex',
    global: join(homedir(), '.codex', 'skills'),
    local: join('.agents', 'skills'),
    files: ['SKILL.md', 'agents', 'references']
  },
  claude: {
    label: 'Claude Code',
    global: join(homedir(), '.claude', 'skills'),
    local: join('.claude', 'skills'),
    files: ['SKILL.md', 'references']
  },
  cursor: {
    label: 'Cursor',
    global: join(homedir(), '.cursor', 'skills'),
    local: join('.cursor', 'skills'),
    files: ['SKILL.md', 'references']
  },
  cline: {
    label: 'Cline',
    global: join(homedir(), '.cline', 'skills'),
    local: join('.cline', 'skills'),
    files: ['SKILL.md', 'references']
  },
  opencode: {
    label: 'OpenCode',
    global: join(homedir(), '.config', 'opencode', 'skills'),
    local: join('.opencode', 'skills'),
    files: ['SKILL.md', 'references']
  }
};

function help() {
  console.log(`Batched Reverse Engineering skill installer\n\nUsage:\n  npx batched-reverse-engineering install [options]\n\nOptions:\n  --global              Install to user-level skill directories\n  --local               Install to the current project's skill directories\n  --tool <names>        Comma-separated tools: codex,claude,cursor,cline,opencode\n  --yes                 Skip prompts and install the selected targets\n  --dry-run             Show mappings without writing files\n  --list                List supported tools and mappings\n  -h, --help            Show this help\n\nExamples:\n  npx batched-reverse-engineering install\n  npx batched-reverse-engineering install --global --tool codex,claude --yes\n  npx batched-reverse-engineering install --local --tool cursor --yes\n`);
}

function listTools() {
  for (const [id, tool] of Object.entries(tools)) {
    console.log(`${id.padEnd(9)} ${tool.label.padEnd(14)} global=${tool.global} local=${tool.local} files=${tool.files.join(',')}`);
  }
}

function parse(argv) {
  const options = { scope: null, selected: [], yes: false, dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--global') options.scope = 'global';
    else if (arg === '--local') options.scope = 'local';
    else if (arg === '--yes') options.yes = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--tool') options.selected = (argv[++i] ?? '').split(',').map((x) => x.trim()).filter(Boolean);
    else if (arg === '--list') options.list = true;
    else if (arg === '-h' || arg === '--help') options.help = true;
    else if (arg === 'install') options.command = 'install';
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function validateSelected(selected) {
  const invalid = selected.filter((id) => !tools[id]);
  if (invalid.length) throw new Error(`Unknown tool(s): ${invalid.join(', ')}. Use --list to see supported tools.`);
}

async function choose(options) {
  const rl = createInterface({ input, output });
  try {
    if (!options.scope) {
      const answer = await rl.question('Install scope: [1] global user install  [2] local project install (default 1): ');
      options.scope = answer.trim() === '2' ? 'local' : 'global';
    }
    if (!options.selected.length) {
      console.log('Supported tools:');
      Object.entries(tools).forEach(([id, tool], index) => console.log(`  ${index + 1}. ${tool.label} (${id})`));
      const answer = await rl.question('Tools (comma-separated numbers or names, default all): ');
      const values = answer.trim() ? answer.split(',').map((x) => x.trim()) : Object.keys(tools);
      options.selected = values.map((value) => {
        const index = Number(value) - 1;
        return Number.isInteger(index) && index >= 0 && index < Object.keys(tools).length ? Object.keys(tools)[index] : value;
      });
    }
    validateSelected(options.selected);
    return options;
  } finally {
    rl.close();
  }
}

function install(options) {
  for (const id of options.selected) {
    const tool = tools[id];
    const base = options.scope === 'global' ? tool.global : resolve(process.cwd(), tool.local);
    const destination = join(base, skillName);
    console.log(`${options.dryRun ? '[dry-run] ' : ''}${tool.label}: ${destination}`);
    for (const relative of tool.files) {
      const source = join(root, relative);
      const target = join(destination, relative);
      console.log(`  ${relative} -> ${target}`);
      if (!options.dryRun) {
        mkdirSync(dirname(target), { recursive: true });
        cpSync(source, target, { recursive: true });
      }
    }
  }
  if (!options.dryRun) console.log(`\nInstalled ${skillName} for: ${options.selected.map((id) => tools[id].label).join(', ')}.`);
}

try {
  const options = parse(process.argv.slice(2));
  if (options.help || (!options.command && !options.list)) { help(); process.exit(0); }
  if (options.list) { listTools(); process.exit(0); }
  if (options.command !== 'install') throw new Error('Use the install command.');
  if (!options.scope || !options.selected.length) {
    if (options.yes) throw new Error('--yes requires --global or --local and --tool.');
    await choose(options);
  } else validateSelected(options.selected);
  install(options);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
