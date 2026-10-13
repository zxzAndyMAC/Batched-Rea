---
name: batched-reverse-engineering
description: Reverse engineer unfamiliar software across desktop, mobile, web, embedded, packaged, managed, native, and mixed targets in bounded, evidence-backed batches; compare versions, reconstruct behavior, and report facts, inferences, and unknowns.
metadata:
  short-description: Reverse engineer software in bounded evidence-backed batches
  version: "2.0"
---

# Batched Reverse Engineering

Use this skill when the target is an unfamiliar, protected, packaged, large, or
mixed software system and the requester needs behavior, architecture, protocol,
version differences, or reconstruction guidance. It covers local artifacts and
explicitly supplied runtime or network evidence. It does not authorize access to
third-party systems, credential bypass, destructive testing, or deployment.

Use `reverse-engineer-anything` first when available for REA routing and
format-specific rules. This skill adds target classification, cost-aware
investigation, cross-tool evidence handling, and synthesis. Read
[references/evidence-ledger.md](references/evidence-ledger.md) for any
multi-batch investigation or handoff.

## Investigation contract

Every conclusion records its claim, evidence ID or source location, target
identity, coverage boundary, confidence, and remaining unknowns. Label claims as
**observed**, **inferred**, or **unknown**. Static relationships do not prove
runtime reachability; a missing observation is unknown until its search boundary
is complete.

Analyze only a target the requester supplied or clearly authorized. Resolve an
ambiguous app name, version, platform, or runtime instance before selecting an
artifact. Do not treat nearby samples, saved reports, repository names, or
example paths as the target.

## Select the smallest useful mode

Start with the least expensive mode that can answer the requested questions:

- **Quick map**: identity, format, entrypoints, imports/exports, resources,
  processes, permissions, stores, and obvious feature seeds.
- **Focused static**: one feature, interface, function, resource, or version
  difference traced from a concrete seed.
- **Runtime probe**: a narrow, reversible observation when static evidence cannot
  answer a material question.
- **Network/API**: supplied HAR, proxy, logs, or an explicitly authorized live
  endpoint; correlate requests with code and state transitions.
- **Batched investigation**: several focused slices joined through stable
  identities when a map or one trace is insufficient.

Escalate only when the current mode leaves a named gap that can change the
answer. Do not perform a broad scan merely because the target is large.

## Target classification and routing

Freeze target identity before analysis: absolute path or endpoint, version/build,
SHA-256 where applicable, platform/architecture, runtime instance, tool versions,
requested questions, and authorization boundary. Record repository revision and
dirty paths separately from shipped-artifact identity.

Classify the target from the supplied evidence, then choose the first suitable
route. Combine routes when a target is mixed:

| Target family | Initial route | Typical follow-ups |
| --- | --- | --- |
| PE/ELF/Mach-O, shared library, core dump | binary layout/overview or `open_binary` | functions, strings, symbols, mitigations, crash context, runtime |
| .NET/Java/JVM/CLR, NativeAOT | managed inspection | metadata, call paths, native boundary, runtime confirmation |
| APK/AAB/DEX, IPA, app bundle | package inventory and manifest | classes, methods, entitlements, IPC, resources, device/runtime |
| Electron/Node/ASAR, browser bundle, web app | application/package summary | module view, feature trace, browser/Electron observation, source maps |
| ZIP/MSIX/AppX/DMG/installer/plugin | archive/member inventory | embedded executables, manifests, resources, install/runtime effects |
| firmware, boot image, filesystem dump, IoT image | region/filesystem map | extraction, partitions, boot chain, services, hardware assumptions |
| scripts, bytecode, WASM, game/resource packages | parser and dependency map | deobfuscation candidates, loaders, embedded assets, runtime probes |
| database, cache, config, logs, crash reports | format-aware inspection | schema/state transitions, provenance, correlation with code/runtime |
| supplied HAR/pcap/proxy/API trace | capture inventory | request/response grouping, schema inference, code correlation |
| live browser, desktop, mobile, or service runtime | passive target listing | narrow action/state probe, process/IPC/network capture |

Use the actual tools advertised by the environment. If REA is available, prefer
its retained evidence and target-free diagnostics. Otherwise use installed
format-aware tools (for example Ghidra/IDA, JADX, dnSpy/ILSpy, Frida, browser
devtools, platform inspectors, firmware parsers, or standard archive/database
tools) and record their exact versions. A tool name in this table is a route,
not a dependency or a promise that it exists.

## Workflow

### 1. Freeze identity, scope, and protection state

Record the target and requested questions as above. Also record whether it is
packed, encrypted, obfuscated, stripped, signed, anti-debugged, virtualized,
JIT/AOT compiled, or otherwise protected. Treat protection findings as evidence,
not as permission to bypass controls. State which actions are passive, which are
authorized probes, and which are out of scope.

Completion criterion: a reader can identify exactly which bytes, capture, source
revision, and runtime instance the evidence describes.

### 2. Build a cheap map

Inventory the smallest useful surface: formats, architectures, entrypoints,
processes, windows/services, imports/exports, IPC/RPC/API surfaces, permissions,
native bindings, loaders, stores, caches, configuration, resources, and network
endpoints. For a packaged target inspect manifests and embedded members before
assuming the outer file is the executable. Record tool and coverage limits.

Completion criterion: each question has a candidate seed and boundary, or an
explicit unresolved starting gap.

### 3. Form adaptive batches

Create a ledger entry per batch. Each batch has:

- one falsifiable question or connected feature slice;
- a seed path, node, symbol, export, channel, request, process, state, or action;
- reused evidence and the reason this batch is needed;
- included and omitted scope, expected output, and a stopping condition;
- likely joins: imports/exports, IPC/RPC, process handoff, shared ID, storage key,
  request correlation, or version identity.

Prefer entrypoint → controller → policy/permission gate → adapter or protocol →
state/persistence → result or recovery. Split when an analyzer budget, worker
heap, file/module boundary, process boundary, or unrelated containment makes the
question ambiguous. Never split only by arbitrary file count.

### 4. Analyze without duplication

Reuse retained evidence or an exported bundle. Page identities before selecting a
node, trace one seed and direction at a time, and inspect an item before asking
for a broad trace. Save the exact producer command/parameters, evidence IDs,
digests, selected locations, observations, inference basis, unknowns, and next
probe. Never repeat an identical analysis merely to obtain a larger display.

### 5. Handle protected targets honestly

For packing, obfuscation, anti-debugging, encrypted resources, stripped symbols,
JIT/AOT, or signing constraints:

1. identify the protection and the affected coverage;
2. use non-invasive metadata, resources, imports, traces, or supplied runtime
   evidence first;
3. narrow the question or use an authorized observation if protection blocks it;
4. record what was not recovered and why.

Do not claim deobfuscation, unpacking, reachability, or semantic equivalence from
names, strings, signatures, or a successful launch alone. If a protection
boundary cannot be crossed within scope, mark the result unknown and give the
smallest next probe or required artifact.

### 6. Correlate processes, state, and network behavior

Follow boundaries that affect the requested behavior: IPC/RPC, plugin hosts,
browser contexts, native addons, services, permissions, files, databases,
caches, environment/configuration, and request/response flows. For supplied
HAR/pcap/proxy/log evidence, preserve record ordinals, timestamps, host/port,
direction, request IDs, and producer metadata; do not fetch recorded URLs or
describe historical captures as live behavior. Infer protocol fields only when
multiple observations support the mapping, and keep opaque bytes as opaque.

### 7. Compare versions and platforms

For each version/platform/build, freeze identity independently. Compare manifests,
resources, symbols, interfaces, feature traces, permissions, protocol schemas,
and runtime outcomes only after confirming artifact identity. Classify a difference
as observed, inferred, or unknown; preserve conflicts instead of silently
choosing one explanation. Do not infer a shipped-artifact change from an
uncommitted source tree.

### 8. Add narrow runtime probes

Use passive browser, Electron, process, mobile, native UI, or service observation
only when static evidence cannot answer a material question. Keep probes narrow,
reversible, and within the stated target/action scope. Record target identity,
action, initial state, result, timing/state dependence, and captured evidence.
Runtime evidence can confirm reachability and transitions; it does not make
unrelated static edges observed.

### 9. Control resource limits and tool failure

Treat failures as coverage information:

- worker heap: retry only the affected module with a supported limit or split it;
- result budget/capacity: request a page, item, narrower trace, or new batch;
- transport truncation: use retained evidence or export a bundle;
- unavailable analyzer: use the nearest installed format-aware route and mark the
  changed coverage;
- missing runtime, symbols, source maps, or capture: continue static work and
  record the missing prerequisite.

Do not install or upgrade unrelated software. Do not rerun a complete analysis
when a smaller retry addresses the reported limit.

### 10. Stitch the evidence graph

Join batches only through stable identity and corroboration: exact path plus
digest, explicit import/export, unique IPC/API literal, shared identifier or
storage key, matching process boundary, request correlation, version identity,
or bounded runtime observation. Filenames, minified names, proximity, and
semantic similarity are candidates, not proof. State the join basis and
confidence for every cross-batch edge. Preserve disagreements and artifact
mismatches.

### 11. Produce the synthesis

For an architecture, comparison, protocol, or reconstruction report include:

1. target identity, authorization boundary, method, and tools;
2. coverage, protection, runtime, and resource limits;
3. observed architecture and feature/protocol paths;
4. version/platform differences when requested;
5. facts, bounded inferences, unknowns, and conflicts with evidence links;
6. prioritized recommendations tied to concrete artifact boundaries;
7. the smallest validation plan and next probes;
8. a compact evidence index with IDs, digests, paths, captures, and batch names.

Use Archify when a diagram clarifies architecture, workflow, sequence, dataflow,
or lifecycle; label proposed designs as proposed. Use `writing-for-agents` when
the report contains an implementation prompt; end each step with a checkable
criterion and keep branch-specific detail behind file pointers.

Completion criterion: another agent can reproduce the investigation, understand
what is known, and choose the next bounded batch without rediscovering the target.

## Stop conditions

Stop when all requested questions are answered or have explicit unknowns, the
next batch would not change a decision, the target is outside authorization, or
the remaining gap requires a different artifact/version, user-owned access, or
runtime action outside scope. Report the stop reason. Never call a
resource-limited or protection-limited investigation comprehensive.
