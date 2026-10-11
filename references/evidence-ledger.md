# Evidence ledger

Use one record per bounded batch. Keep the working ledger in the investigation output directory, not in the skill installation directory.

```yaml
investigation:
  target: /absolute/path/to/artifact-or-runtime
  version: unknown
  digest: unknown
  platform: darwin-arm64
  tool: rea
  questions:
    - id: Q1
      text: How is a task resumed after the UI closes?

batches:
  - id: B01
    question: What starts a local session?
    seed: "exact node, path, IPC channel, export, or runtime action"
    depends_on: []
    producer: "exact REA command and parameters"
    evidence_ids: [ev_001]
    artifact_digests: [sha256:unknown]
    scope:
      included: ["entrypoint", "session controller"]
      omitted: ["unrelated renderer chunks"]
    observations:
      - claim: "..."
        kind: observed
        confidence: high
        locations: ["path:line-line or node ID"]
    joins:
      - to_batch: B02
        basis: "unique IPC literal / exact import / shared ID / runtime observation"
        confidence: medium
    unknowns:
      - "..."
    next_probe: "..."
    status: answered
```

Allowed `kind` values are `observed`, `inferred`, and `unknown`. Every claim in the final report should point to at least one observation location or evidence ID. Every cross-batch join should state why the two records refer to the same boundary. If a resource limit interrupts a batch, keep the partial observations, mark the omitted scope, name the exact limit, and set a concrete next probe.

Recommended status values are `planned`, `running`, `answered`, `partial`, `blocked`, and `stopped`. A batch is complete only when its question is answered or the ledger records an unresolved gap and the next bounded probe that could resolve it.
