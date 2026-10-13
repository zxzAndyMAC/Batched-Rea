# Batched Reverse Engineering

[简体中文](README.zh-CN.md)

A reusable agent skill for reverse-engineering unfamiliar software across desktop, mobile, web, service, embedded, packaged, and mixed targets in bounded, evidence-backed batches.

It is designed for targets whose module count is unknown and whose analysis may exceed an analyzer's heap, result budget, or practical review scope. The skill uses REA as the analysis engine when available, preserves evidence across batches, joins only supported relationships, and produces a confidence-labeled architecture or comparison report.

## What it solves

- Discover the shape of an unknown application before choosing batch boundaries.
- Analyze entrypoints, processes, IPC/API surfaces, native bindings, storage, permissions, and feature paths incrementally.
- Separate observed facts, bounded inferences, and unresolved unknowns.
- Record analyzer limits as coverage boundaries instead of silently treating partial output as a complete model.
- Hand the resulting evidence to architecture-diagram and implementation-prompt workflows.

## Install

### Interactive `npx` installer

After the package is published to npm, the recommended installation is:

```bash
npx batched-reverse-engineering install
```

The command delegates installation to the official Vercel Skills CLI. It discovers compatible agents, prompts for global or project-local scope, handles existing skills, and maps the canonical `SKILL.md` and references using the CLI's standard link/copy behavior. Codex also receives `agents/openai.yaml`; other tools receive the portable skill and references.

For scripts and CI, skip prompts explicitly:

```bash
npx batched-reverse-engineering install --global --tool codex,claude --yes
npx batched-reverse-engineering install --local --tool cursor --yes
npx batched-reverse-engineering install --list
```

Use `--dry-run` to print the delegated mapping before writing files. Add `--copy` when you want files copied instead of linked.

### Project-local installation

Copy the skill into the project-level skills directory used by your agent runtime:

```bash
mkdir -p .agents/skills/batched-reverse-engineering
cp -R /path/to/Batched-Rea/SKILL.md /path/to/Batched-Rea/agents /path/to/Batched-Rea/references .agents/skills/batched-reverse-engineering/
```

For Codex-compatible project skills, the resulting layout is:

```text
.agents/skills/batched-reverse-engineering/
├── SKILL.md
├── agents/openai.yaml
└── references/evidence-ledger.md
```

Project-local installation is useful when a repository wants the workflow versioned alongside its analysis instructions.

### Global installation

For Codex, install it for the current user. Every project opened by Codex can then discover the skill from this user-level directory; other agent tools can use it only if they read the same directory or receive a copy in their own global skills directory:

```bash
mkdir -p ~/.codex/skills/batched-reverse-engineering
cp -R SKILL.md agents references ~/.codex/skills/batched-reverse-engineering/
```

If another agent runtime uses a different global skills directory, copy the same three entries there as well. A global install is user-wide within a compatible runtime, not automatically shared across unrelated agent products.

### Ask your agent to install it

You can tell an agent with filesystem and shell access:

> Install the `batched-reverse-engineering` skill from `https://github.com/zxzAndyMAC/Batched-Rea` into the appropriate project-local or global skills directory, preserve `SKILL.md`, `agents/openai.yaml`, and `references/evidence-ledger.md`, then validate that the skill is discoverable.

After installation, invoke it with:

```text
$batched-reverse-engineering
```

## Dependencies and related skills

The workflow itself is documentation-only and has no language-package dependency. It assumes an agent can read local files and run the relevant analysis tools.

Recommended companion skills:

- `reverse-engineer-anything`: routes native, managed, Electron/JavaScript, packaged, firmware, and browser targets to REA workflows.
- `archify`: creates explorable architecture, workflow, sequence, data-flow, and lifecycle diagrams as standalone HTML.
- `writing-for-agents`: turns findings into clear, executable instructions for another agent.

REA is the preferred analysis engine when available. The skill does not bundle REA or replace target-specific tooling.

## Typical usage

```text
Use $batched-reverse-engineering to analyze /path/to/unknown-app.
Answer these questions:
1. How does the app start and create its main session?
2. Which process or module owns permissions and persistence?
3. What remains unknown after the first bounded pass?

Use REA where available. Keep an evidence ledger, split the work into bounded batches,
and produce a confidence-labeled report with a next-probe plan.
```

For a full report with diagrams and an implementation prompt:

```text
Use $batched-reverse-engineering for the evidence collection.
Then use $archify for the architecture and workflow diagrams.
Finally use $writing-for-agents to write an AI-executable implementation plan with P0/P1 priorities.
```

## Investigation model

1. Freeze artifact identity, version, digest, platform, and questions.
2. Build a cheap global map before deep expansion.
3. Form batches around entrypoints, processes, IPC, storage, permission boundaries, or concrete feature traces.
4. Save each batch's command, evidence IDs, scope, observations, joins, unknowns, and next probe.
5. Stitch batches only through stable identities and corroborating evidence.
6. Add runtime probes only when static evidence cannot answer a material question.
7. Report heap, result-budget, or transport limits explicitly.
8. Stop when questions are answered or the next batch would not change a decision.

See [`references/evidence-ledger.md`](references/evidence-ledger.md) for the recommended ledger format.

## Repository layout

```text
SKILL.md                         # Agent instructions and workflow
agents/openai.yaml               # Codex skill metadata
references/evidence-ledger.md    # Reusable batch evidence template
```

## Contributing

Keep changes focused on repeatable investigation behavior. If you add a rule, explain its trigger, evidence requirement, stopping condition, and failure mode. Keep examples vendor-neutral unless a tool-specific behavior is essential.

## License

This repository is licensed under the MIT License. See [LICENSE](LICENSE).
