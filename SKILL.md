---
name: batched-reverse-engineering
description: Analyze an unknown or oversized local software artifact in bounded, adaptive batches, preserve evidence across batches, and synthesize a confidence-labeled architecture or comparison report.
metadata:
  short-description: Analyze unknown software in bounded batches
  version: "1.0"
---

# Batched Reverse Engineering

Use this skill when the target is an unfamiliar, large, packaged, Electron/JavaScript, native, or mixed application and a single deep analysis may exceed analyzer memory, result capacity, or useful review scope. The requester does not need to know the module count in advance.

Use REA as the analysis engine when it is available. Load `reverse-engineer-anything` first for target routing and format-specific rules. This skill adds the investigation strategy: discover the shape, partition by evidence and unanswered questions, analyze batches, stitch only supported relationships, and produce a report that distinguishes facts from inferences and unknowns.

Read [evidence-ledger.md](references/evidence-ledger.md) when starting a multi-batch investigation or when handing work to another agent.

## Investigation contract

A conclusion is complete only when its claim, evidence ID or source location, coverage boundary, confidence, and remaining unknowns are recorded. Static relationships do not prove runtime reachability. A missing observation is unknown until the relevant search boundary is complete.

Do not choose batches by arbitrary file count. Choose them by a concrete question and a boundary visible in the target: entrypoint, process, window, IPC/API surface, import cluster, native binding, persistence store, permission boundary, or feature trace.

## Workflow

### 1. Freeze identity and scope

Record the exact artifact path, version, digest, platform, active process or runtime target when relevant, analysis tool/version, and requested questions. For a repository comparison, record repository revision and dirty paths separately. Do not imply that uncommitted source proves a shipped-artifact claim.

Completion criterion: a reader can identify exactly which bytes and runtime instance the evidence describes.

### 2. Build a cheap map

Run the smallest useful overview or inventory first. For an Electron/JavaScript target, prefer the REA application summary; for an archive, inventory members; for a native target, record format, architectures, imports/exports and load boundaries. Capture entrypoints, processes, windows, IPC/API surfaces, native addons, stores and obvious feature seeds.

The map is a discovery artifact, not a final architecture. Record analyzer limitations immediately.

Completion criterion: each requested question has at least one candidate entrypoint or an explicit unresolved starting gap.

### 3. Form adaptive batches

Create a batch ledger. Each batch must contain:

- one narrow question or one connected feature slice;
- seed node, path, channel, export, process, or runtime action;
- why the batch is needed and which prior evidence it reuses;
- expected output and stopping condition;
- likely cross-batch joins, such as IPC sender/receiver, import/export, shared store, session ID, or process handoff.

Prefer this order: entrypoint → controller → policy/permission gate → runtime adapter → persistence/evidence → result or recovery. Split a batch when semantic expansion consumes the parent result budget, when a file exhausts the worker heap, or when unrelated containment relationships dominate the trace.

Completion criterion: every batch has a falsifiable question and a bounded stopping condition; no batch exists only because a file was nearby.

### 4. Analyze each batch without duplication

Reuse the retained parent Evidence or exported bundle. Page module identities before selecting a node. Trace one seed and one direction at a time; use `both` only when the question requires it. Inspect a module item before requesting a broad trace when the module observations already answer the question.

For every batch, save:

- producer command and exact parameters;
- Evidence ID, artifact digest, selected node IDs and source paths;
- observations and direct quotations only when needed for disambiguation;
- inferred relationships, their basis, and confidence;
- unknown or incomplete scopes;
- next batch triggers.

Never repeat an identical analysis merely to get a larger display. Use a smaller view, a narrower trace, or an exported evidence bundle.

Completion criterion: the batch answers its question or records a concrete unresolved gap and the next probe that could resolve it.

### 5. Stitch the evidence graph

Join batches only through stable identity and corroborating evidence: exact paths plus artifact digest, unique IPC literals, explicit imports/exports, shared identifiers, matching process boundaries, common persistence keys, or bounded runtime observations. Treat minified names, filenames, and semantic similarity as candidates, not proof.

Classify every synthesized statement as:

- **Observed**: directly present in static or runtime evidence;
- **Inferred**: a bounded interpretation supported by multiple observations;
- **Unknown**: not established within the analyzed boundary.

If two batches disagree, preserve both observations, check artifact/version identity, and mark the conflict. Do not silently pick the more convenient explanation.

Completion criterion: every report claim points to one or more ledger entries and every cross-batch edge has a stated join basis.

### 6. Add runtime probes only for material gaps

Use passive runtime, Electron, browser, process, or native UI observation only when static evidence cannot answer a question that changes the conclusion. Keep probes narrow and reversible. Record target identity, action scope, observed result, and whether the observation is representative or state-dependent.

Runtime evidence can confirm reachability and state transitions; it does not retroactively make unrelated static relationships observed.

Completion criterion: each probe closes a named gap or is recorded as inconclusive with a reason.

### 7. Control resource limits

Treat analyzer resource messages as coverage information:

- **Worker heap exhausted**: retry only the affected module with a larger analyzer heap if available, or split the module/feature; do not rerun the whole application by default.
- **Parent result budget/capacity exhausted**: request a page, item view, narrower trace, or separate batch; increasing model context will not change this analyzer limit.
- **Transport truncation**: use the retained Evidence ID or export a bundle; never parse a truncated preview as canonical evidence.

Record the exact limit and affected scope. A resource-limited batch may support static facts while leaving semantic relationships unknown.

Completion criterion: the report states analyzed coverage, omitted scope, and the reason for every material gap.

### 8. Produce the synthesis

For an architecture or comparison report, include:

1. target identity and method;
2. evidence/coverage limits;
3. observed architecture and feature paths;
4. comparison or reconstruction findings;
5. confidence-labeled unknowns;
6. prioritized recommendations tied to concrete source or artifact boundaries;
7. validation plan for the next probes;
8. a compact evidence index with Evidence IDs, digests, paths and batch names.

Use Archify when diagrams clarify architecture, workflow, sequence, dataflow, or lifecycle. Diagram nodes and relationships must use the stitched evidence; proposed target designs must be labeled as proposed. Use `writing-for-agents` when the report includes an implementation prompt: put shared steps in the prompt, move branch-specific detail behind file pointers, and end each step with a checkable completion criterion.

Completion criterion: another agent can reproduce the investigation from the ledger, understand what is known, and choose the next bounded batch without rediscovering the target.

## Stop conditions

Stop the investigation when all requested questions are answered or have explicit unknowns, the next batch would not change a decision, or the remaining gap requires user-owned access, a different artifact version, or a runtime action outside scope. Report the stop reason. Do not call a resource-limited static investigation comprehensive.
