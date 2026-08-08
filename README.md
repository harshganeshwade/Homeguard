HomeGuard — Cyber Attack Graph & Risk Prediction System

An interactive security analysis tool that models an organization's IT infrastructure as a directed, weighted multigraph, runs classic graph algorithms to trace attacker reachability, layers a Random Forest model on top to predict compromise likelihood, and surfaces the results through a dark, "immersive cyber-ops" dashboard — with an optional Gemini-powered AI layer for narrative briefs and natural-language threat queries.

Scope note: HomeGuard operates entirely on modeled/simulated topology data. It performs no live network scanning, no exploitation, and no actions against real systems. All "attacks" are state changes on the in-app graph model. See Security & Trust Boundaries below.

Status

Actively developed. Core graph engine, ML risk layer, dashboard, and AI integrations are implemented and hardened. Attack Labs (live, tick-based attack/defend simulation) is specified but not yet built — see Roadmap.

Features Implemented
Graph Engine
Directed, weighted multigraph model — supports multiple distinct edges between the same two nodes (e.g., separate SQL / SSH / HTTPS relationships between a web server and a database), each with its own protocol, port, CVSS score, exploitability, and auth requirement.
Interactive algorithm suite:
BFS — reachability from a compromised node
DFS — attack path enumeration
Dijkstra — lowest-cost / highest-risk path
A* — heuristic-accelerated path search for larger graphs
Betweenness Centrality — chokepoint / critical-asset ranking
Connected Components — isolated network segment detection
Cycle Detection — suspicious loop detection
Random Forest ML Engine
Per-node/edge feature extraction (degree, in/out-degree, CVSS, open ports, auth requirement, centrality, attack-path count, connection frequency, prior-incident flag).
Live diagnostics panel: ROC-AUC, Accuracy, Precision, Recall, F1, feature importances, and an interactive confusion matrix.
Methodological Rigor Disclaimer in the UI noting synthetic ground-truth heuristics and class-imbalance considerations, so metrics aren't read as validated against real-world incident data.
On-demand re-scoring of the graph as data changes.
Attack Risk Engine
Combines graph reachability with per-hop ML risk scores into ranked, severity-labeled attack paths (LOW → CRITICAL).
Hop-by-hop breakdown with concrete mitigation suggestions per path.
Smart Fallback Defaults — clicking "Analyze Risk" with no manual selection auto-assigns a sensible entry/target pair, visibly labeled as a default, with immediate path recalculation and camera focus on the top-risk path.
Interactive Dashboard (Immersive Cyber-Ops UI)
Dark palette (
#05070a base, 
#0a0f18 surfaces), cyan-400 node highlights, red threat indicators, radial grid background.
Cytoscape.js canvas: real-time attack-path overlays, node inspector (CVE breakdown), simulation-state controls (Set Compromised, Set Target, Quarantine/Isolate — with distinct dashed-yellow isolation styling).
Ranked attack path panel with filtering by node/segment/severity.
Centrality/criticality rankings for hardening priorities.
In-app PRD & Architecture Spec modal, accessible from the top nav, documenting the system diagram, design tokens, NFRs, and success metrics.
AI Layer (Gemini, server-side)
AI Security Brief — server-generated narrative summary of ranked attack paths and mitigations. Cache key is bound to active isolation state, so quarantining a node immediately invalidates and regenerates stale briefs.
AI Threat Copilot — natural-language querying over the current graph/ML state, with:
RAG-style grounding in live graph data (not general knowledge)
Explicit [node-id] citations in every response
Server-side citation verification — cross-references cited IDs against actual graph topology and renders a ✓ N/N Node Citations Verified badge; invalid citations are flagged, not silently trusted
Prompt-injection sanitization on user queries (instruction-override patterns, raw HTML)
AI-Assisted Guidance disclaimer (non-authoritative, requires human verification)
API quota gauge and pre-set prompt chips for common threat-hunting queries
Security Controls (the tool's own hardening)
Fail-closed payload redactor — schema-driven allowlist for data sent to Gemini; malformed/unexpected structures fail closed to an empty payload rather than leaking unverified fields.
Human-in-the-Loop remediation — "Approve & Apply to Simulation" buttons (explicitly not "Execute") bind containment approvals to the isolation engine and trigger reachability re-evaluation. No action in the current build touches real infrastructure.
Immutable, hash-chained audit log — every approval records analystId, timestamp, asset details, and a hash/previousHash pair, displayed in the SOC Audit Trail panel.
Cascading cache invalidation — isolating a node invalidates dependent AI briefs and re-triggers path/reachability recomputation rather than leaving stale results on screen.
Architecture
        Network Data (config / logs / CSV)
                      │
                      ▼
              Multigraph Builder
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
   Graph Algorithms         Feature Extraction
   (BFS, DFS, Dijkstra,           │
    A*, Centrality,               ▼
    Components, Cycles)     Random Forest Model
          │                       │
          └───────────┬───────────┘
                      ▼
                Attack Risk Engine
             (path scoring & ranking)
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
            Dashboard        Gemini AI Layer
      (Cytoscape canvas,    (Security Brief,
       path rankings,        Threat Copilot —
       audit trail)          server-side only,
                              redacted payloads)
Tech Stack
Layer	Technology
Graph engine	Multigraph model (networkx-style / equivalent), custom algorithm runners
ML	Random Forest (scikit-learn-style pipeline)
Frontend	React, Cytoscape.js v3.28, custom Immersive Cyber-Ops theme
Backend	Node/TypeScript (server.ts)
AI	Gemini (server-side calls only — key never exposed client-side)
Security & Trust Boundaries

This is a security-analysis tool, so it's held to a higher bar on its own hardening:

No live scanning or exploitation. All attack states are flags on the in-app graph model.
No client-side API keys. Gemini calls are server-side only.
Redaction is fail-closed. Unexpected data shapes result in an empty payload to Gemini, never an unredacted one.
AI output is grounded and verified, not trusted blindly. Copilot citations are cross-checked against real graph IDs server-side before being marked verified in the UI.
Remediation is human-approved and audit-logged. Nothing auto-applies; every action is tied to an analyst and hash-chained for tamper-evidence.

Known open items on this front (see PRD §12 open questions and prior review notes): authenticated identity binding for analystId (currently a field, not yet tied to real session auth), independent hash-chain verification outside the app process, and server-side rate limiting on Gemini endpoints beyond the UI quota gauge.

Roadmap
 Attack Labs — live, tick-based stochastic propagation simulator with manual/auto-step modes, analyst intervention (isolate/patch/restrict-edge), scoring, replay, and a grounded AI after-action debrief. Fully specified in the PRD (§11); not yet implemented.
 Authenticated identity binding for audit-log entries
 Independent/external hash-chain verification
 Server-side rate limiting on Gemini endpoints
 Precision-recall curve alongside ROC-AUC in ML diagnostics
 Export/compliance report generation from the audit trail
Disclaimer

HomeGuard is a demonstration / portfolio-grade analysis tool. Risk scores are derived from modeled and/or synthetic data and should not be treated as a validated assessment of real-world security posture without independent review.
