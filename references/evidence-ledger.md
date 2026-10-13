# Evidence ledger

Keep the working ledger in the investigation output directory, never in the
installed skill directory. Use one record per bounded batch and one identity
record per artifact, capture, source revision, or runtime instance.

```yaml
investigation:
  target_kind: desktop|mobile|web|service|embedded|mixed|unknown
  authorization: requester-supplied|explicit-probe|passive-only
  questions:
    - id: Q1
      text: How is a task resumed after the UI closes?
  identities:
    - id: T1
      target: /absolute/path/to/artifact-or-runtime
      version: unknown
      digest: sha256:unknown
      platform: darwin-arm64
      build: unknown
      protection: [stripped]
      tool_versions: {rea: unknown}
      runtime_instance: unknown
      source_revision: unknown
      dirty_paths: []

batches:
  - id: B01
    question: What starts a local session?
    seed: "exact node, path, IPC channel, export, request, or runtime action"
    depends_on: []
    producer: "exact command and parameters"
    evidence_ids: [ev_001]
    identity_ids: [T1]
    scope:
      included: [entrypoint, session controller]
      omitted: [unrelated renderer chunks]
    observations:
      - claim: "..."
        kind: observed
        confidence: high
        locations: ["path:line-line or node ID"]
    joins:
      - to_batch: B02
        basis: "unique IPC literal / exact import / shared ID / request ID / runtime observation"
        confidence: medium
    unknowns:
      - "..."
    resource_limits: []
    runtime_probe:
      action: none
      state: unknown
      result: unknown
    network_records: []
    next_probe: "..."
    status: answered
```

Allowed `kind` values are `observed`, `inferred`, and `unknown`. Every claim in
the final report points to an observation location or evidence ID. Every
cross-batch join states why the records refer to the same boundary. For version
comparisons, create separate identity records and record the comparison basis.
For network captures, preserve producer, record ordinal, direction, timestamp,
request/correlation ID, and whether the record is historical or live.

Recommended status values are `planned`, `running`, `answered`, `partial`,
`blocked`, and `stopped`. A batch is complete only when its question is answered
or the ledger records an unresolved gap and the next bounded probe that could
resolve it. Record omitted scope and the exact reason whenever a resource or
protection boundary interrupts a batch.
