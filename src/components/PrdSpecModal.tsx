/**
 * HomeGuard - PRD & Architecture / Design System Specification Modal
 * Full 8-Point PRD Specification, Immersive Cyber-Ops Design System, Architecture Diagram & Success Metrics
 */

import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Cpu,
  Layers,
  Sparkles,
  Bot,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Server,
  Activity,
  Zap,
  Sliders,
  FileCode,
  ArrowRight,
  Database,
  BarChart2,
  Terminal,
} from 'lucide-react';

interface PrdSpecModalProps {
  onClose: () => void;
}

export const PrdSpecModal: React.FC<PrdSpecModalProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<
    | 'rebrand'
    | 'designSystem'
    | 'dashboard'
    | 'securityBrief'
    | 'copilot'
    | 'nonFunctional'
    | 'architecture'
    | 'metrics'
    | 'attackLabs'
  >('rebrand');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 font-sans">
      <div className="bg-[#0a0f18] border border-cyan-500/40 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-300">
        {/* Header */}
        <div className="px-6 py-4 bg-[#05070a] border-b border-cyan-900/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>HomeGuard PRD & Architecture Specification</span>
                <span className="px-2 py-0.5 text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-full font-mono">
                  PRD v2.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Cyber Attack Graph & Risk Prediction System — System Design & Non-Functional Specs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Left Navigation & Right Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-[#05070a]/90 border-r border-slate-800/80 p-3 space-y-1 overflow-y-auto shrink-0 text-xs font-mono">
            <button
              onClick={() => setActiveSection('rebrand')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeSection === 'rebrand'
                  ? 'bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-800'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              <span>1. Rebrand & Scope</span>
            </button>

            <button
              onClick={() => setActiveSection('designSystem')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeSection === 'designSystem'
                  ? 'bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-800'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>2. Immersive Design System</span>
            </button>

            <button
              onClick={() => setActiveSection('dashboard')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeSection === 'dashboard'
                  ? 'bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-800'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>3. Dashboard & Cytoscape.js</span>
            </button>

            <button
              onClick={() => setActiveSection('securityBrief')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeSection === 'securityBrief'
                  ? 'bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-800'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>4. AI Security Brief</span>
            </button>

            <button
              onClick={() => setActiveSection('copilot')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeSection === 'copilot'
                  ? 'bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-800'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>5. AI Threat Copilot</span>
            </button>

            <button
              onClick={() => setActiveSection('nonFunctional')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeSection === 'nonFunctional'
                  ? 'bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-800'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>6. Non-Functional Req.</span>
            </button>

            <button
              onClick={() => setActiveSection('architecture')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeSection === 'architecture'
                  ? 'bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-800'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>7. Architecture Diagram</span>
            </button>

            <button
              onClick={() => setActiveSection('metrics')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeSection === 'metrics'
                  ? 'bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-800'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>8. Success Metrics</span>
            </button>

            <button
              onClick={() => setActiveSection('attackLabs')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeSection === 'attackLabs'
                  ? 'bg-rose-950/80 text-rose-300 font-semibold border border-rose-800'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>9. Attack Labs v2.1</span>
            </button>
          </div>

          {/* Main Panel Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm">
            {activeSection === 'rebrand' && (
              <div className="space-y-4">
                <div className="p-4 bg-cyan-950/30 border border-cyan-800/60 rounded-xl">
                  <h3 className="text-base font-bold text-white mb-1">
                    Product Rebrand Specification
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Official product designation updated to:{' '}
                    <strong className="text-cyan-400 font-mono">
                      HomeGuard — Cyber Attack Graph & Risk Prediction System
                    </strong>
                    . This rebrand reflects the full integration of graph analytics, Random Forest ML prediction, and server-side Gemini 3.6 Flash security intelligence.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                    <h4 className="font-bold text-slate-200 text-xs uppercase font-mono text-cyan-400">
                      Core Functional Pillars
                    </h4>
                    <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                      <li>Deterministic Attack Graph Generation (BFS, DFS, Dijkstra, A*, Centrality)</li>
                      <li>Random Forest Cyber Risk Classifier (ROC-AUC 0.885)</li>
                      <li>Cytoscape.js Interactive Topology Canvas</li>
                      <li>Server-Side Gemini 3.6 Flash AI Brief & RAG Threat Copilot</li>
                      <li>Human-in-the-Loop Asset Isolation & Patch Playbooks</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                    <h4 className="font-bold text-slate-200 text-xs uppercase font-mono text-cyan-400">
                      Primary Target Use Cases
                    </h4>
                    <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                      <li>Security Operations Center (SOC) Lateral Movement Diagnostics</li>
                      <li>Cyber Risk Assessment & Crown Jewel Bottleneck Identification</li>
                      <li>Automated Incident Response Playbook Validation</li>
                      <li>AI-Assisted DFIR Threat Copilot & Remediation Guidance</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'designSystem' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white mb-2">
                  Immersive Cyber-Ops Palette Specification
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-[#05070a] border border-slate-800 rounded-xl text-center space-y-1">
                    <div className="w-full h-8 bg-[#05070a] rounded border border-slate-700"></div>
                    <div className="text-xs font-mono font-bold text-white">#05070a</div>
                    <div className="text-[10px] text-slate-400">Dark Base Canvas</div>
                  </div>

                  <div className="p-3 bg-[#0a0f18] border border-slate-800 rounded-xl text-center space-y-1">
                    <div className="w-full h-8 bg-[#0a0f18] rounded border border-slate-700"></div>
                    <div className="text-xs font-mono font-bold text-white">#0a0f18</div>
                    <div className="text-[10px] text-slate-400">Panel Container Base</div>
                  </div>

                  <div className="p-3 bg-slate-900 border border-cyan-500/40 rounded-xl text-center space-y-1">
                    <div className="w-full h-8 bg-cyan-400 rounded"></div>
                    <div className="text-xs font-mono font-bold text-cyan-400">#22d3ee</div>
                    <div className="text-[10px] text-slate-400">Cyan Node Highlight</div>
                  </div>

                  <div className="p-3 bg-slate-900 border border-red-500/40 rounded-xl text-center space-y-1">
                    <div className="w-full h-8 bg-red-500 rounded"></div>
                    <div className="text-xs font-mono font-bold text-red-400">#ef4444</div>
                    <div className="text-[10px] text-slate-400">Threat & Compromise</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="font-bold text-slate-200 text-xs uppercase font-mono text-cyan-400">
                    Node State Styling Matrix
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2 bg-slate-950 border border-slate-700 rounded text-slate-300">
                      <strong className="text-emerald-400 block mb-0.5">HEALTHY / CLEAN</strong>
                      Asset color border, standard fill
                    </div>
                    <div className="p-2 bg-red-950/60 border border-red-700 rounded text-red-200">
                      <strong className="text-red-400 block mb-0.5">COMPROMISED</strong>
                      Red glow fill, 5px red border
                    </div>
                    <div className="p-2 bg-amber-950/60 border border-amber-700 rounded text-amber-200">
                      <strong className="text-amber-400 block mb-0.5">TARGET ASSET</strong>
                      Amber fill, crosshair indicator
                    </div>
                    <div className="p-2 bg-yellow-950/60 border border-yellow-700 rounded text-yellow-200">
                      <strong className="text-yellow-400 block mb-0.5">ISOLATED / QUARANTINE</strong>
                      Hazard hash pattern, severed traffic
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'dashboard' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white mb-2">
                  Section 6.5: Dashboard & Cytoscape.js Rendering
                </h3>

                <div className="p-4 bg-slate-900/80 border border-cyan-800/60 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono text-xs">
                    <Sliders className="w-4 h-4" />
                    <span>Rendering Engine: Cytoscape.js</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Cytoscape.js handles hardware-accelerated graph canvas rendering. Node inspector side-drawer displays real-time asset properties, subnet info, OS, open ports, and full CVE vulnerability breakdowns.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                    <h4 className="font-bold text-xs font-mono text-cyan-400 uppercase">
                      Node Inspector Controls
                    </h4>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                      <li>CVSS score badges & severity classification</li>
                      <li>Affected ports & protocol listeners</li>
                      <li>Exploit availability status</li>
                      <li>Direct simulation-state action triggers</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                    <h4 className="font-bold text-xs font-mono text-cyan-400 uppercase">
                      Simulation State Toggles
                    </h4>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                      <li>Toggle Compromised Entry Point</li>
                      <li>Toggle High-Value Target Asset</li>
                      <li>Toggle Quarantine Isolation Mode</li>
                      <li>Instant graph re-computation on toggle</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'securityBrief' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white mb-2">
                  AI Security Brief (Server-Side Gemini 3.6 Flash)
                </h3>

                <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Grounding Constraint Mandate</span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    Gemini explicitly summarizes and narrates already-computed attack path rankings, hop CVSS scores, and bottleneck assets. It is strictly forbidden from inventing hallucinated CVE IDs or non-existent assets.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
                  <h4 className="font-bold text-cyan-400 uppercase">Brief Payload & Cadence</h4>
                  <p className="text-slate-400">
                    - Payload Sent: Path ID, ML Risk Score, Bottleneck Node, Sanitized Hops (No secrets/credentials).
                    <br />
                    - Cadence: Cached per Path ID with a manual &quot;Regenerate Live&quot; override.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'copilot' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white mb-2">
                  AI Threat Copilot Specification
                </h3>

                <div className="p-4 bg-purple-950/30 border border-purple-800/60 rounded-xl space-y-2">
                  <h4 className="font-bold text-purple-300 text-xs font-mono uppercase">
                    RAG-Grounded Context & Guardrails
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The Copilot accepts natural language queries regarding the topology, active attack paths, graph algorithms, and CVE mitigations. Requests are augmented with real-time graph state. Non-cyber queries receive polite guardrail redirections.
                  </p>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-amber-300">
                  ⚠️ Safety Disclaimer: HomeGuard AI Copilot guidance is advisory. Never auto-declare a system 100% safe. All remediation actions require human SOC approval.
                </div>
              </div>
            )}

            {activeSection === 'nonFunctional' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white mb-2">
                  Non-Functional Requirements Specification
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                    <h4 className="font-bold text-xs font-mono text-cyan-400 uppercase">
                      Data Governance & Privacy
                    </h4>
                    <p className="text-xs text-slate-400">
                      All payload fields are sanitized before being sent to Gemini API. Passwords, bearer tokens, and private key strings are redacted.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                    <h4 className="font-bold text-xs font-mono text-cyan-400 uppercase">
                      API Key Handling
                    </h4>
                    <p className="text-xs text-slate-400">
                      GEMINI_API_KEY is restricted strictly to server-side Express handlers (<code className="text-cyan-300">/api/gemini/*</code>). The key is NEVER exposed in the client web bundle.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                    <h4 className="font-bold text-xs font-mono text-cyan-400 uppercase">
                      Latency Isolation
                    </h4>
                    <p className="text-xs text-slate-400">
                      AI calls run asynchronously in the background. Cytoscape graph rendering and algorithm calculations remain non-blocking at 60 FPS.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                    <h4 className="font-bold text-xs font-mono text-cyan-400 uppercase">
                      Human-in-the-Loop Control
                    </h4>
                    <p className="text-xs text-slate-400">
                      Playbook remediations require explicit human confirmation (&quot;Approve & Execute Isolation&quot;) before modifying topology state.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'architecture' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white mb-2">
                  System Architecture Diagram
                </h3>

                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs space-y-4 text-slate-300 overflow-x-auto">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-cyan-950 border border-cyan-800 rounded-xl text-center w-80">
                      <strong className="text-cyan-300 block">CLIENT LAYER (Browser)</strong>
                      <span>Cytoscape.js Canvas | Risk Engine | Copilot UI</span>
                    </div>

                    <div className="text-slate-500 font-bold">↓ Async HTTP POST (/api/gemini/*)</div>

                    <div className="p-3 bg-blue-950 border border-blue-800 rounded-xl text-center w-80">
                      <strong className="text-blue-300 block">EXPRESS SERVER PROXY (Node.js)</strong>
                      <span>Data Redactor | API Key Guard | Rate Limiter</span>
                    </div>

                    <div className="text-slate-500 font-bold">↓ Secure Server Request (GEMINI_API_KEY)</div>

                    <div className="p-3 bg-purple-950 border border-purple-800 rounded-xl text-center w-80">
                      <strong className="text-purple-300 block">GOOGLE GEMINI 3.6 FLASH</strong>
                      <span>Grounded Security Brief & Threat Copilot Model</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'metrics' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white mb-2">
                  Success & Performance Metrics
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                  <div className="p-4 bg-slate-900 border border-cyan-500/40 rounded-xl text-center">
                    <div className="text-2xl font-bold text-cyan-400">99.4%</div>
                    <div className="text-xs text-slate-400 mt-1">Copilot Grounding Accuracy</div>
                  </div>

                  <div className="p-4 bg-slate-900 border border-blue-500/40 rounded-xl text-center">
                    <div className="text-2xl font-bold text-blue-400">1.2s - 2.4s</div>
                    <div className="text-xs text-slate-400 mt-1">AI Brief Generation Latency</div>
                  </div>

                  <div className="p-4 bg-slate-900 border border-indigo-500/40 rounded-xl text-center">
                    <div className="text-2xl font-bold text-indigo-400">0.885</div>
                    <div className="text-xs text-slate-400 mt-1">Random Forest ML ROC-AUC</div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'attackLabs' && (
              <div className="space-y-4">
                <div className="p-4 bg-rose-950/30 border border-rose-800/60 rounded-xl">
                  <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-rose-400" />
                    <span>11. Section 12 — Attack Labs: Live Simulation & Mitigation Training (v2.1)</span>
                  </h3>
                  <p className="text-xs text-rose-200/80">
                    Simulates stochastic attacker lateral movement over the multigraph in discrete time ticks, allowing security analysts to practice real-time containment interventions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <strong className="text-cyan-300 block">F24-F28 Stochastic Propagation Engine</strong>
                    <p className="text-slate-400 text-[11px]">
                      Computes edge propagation probability <code className="text-cyan-400">f(risk_weight, exploitability, auth_required, aggressiveness)</code> and rolls stochastic state transitions per tick.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <strong className="text-purple-300 block">F34-F35 Mid-Run Analyst Interventions</strong>
                    <p className="text-slate-400 text-[11px]">
                      Analysts can execute Isolate Node, Patch Asset, or Restrict Edge mid-run. Actions write cryptographic SHA-256 audit entries onto the immutable hash chain.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <strong className="text-amber-300 block">F36-F37 After-Action Scorecard & AI Debrief</strong>
                    <p className="text-slate-400 text-[11px]">
                      Calculates Containment Score, Speed Bonus, Target Penalty, and final Letter Grade (S/A/B/C/F), backed by a grounded Gemini After-Action report.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <strong className="text-emerald-300 block">F38 Tick Replay Scrubbing</strong>
                    <p className="text-slate-400 text-[11px]">
                      Allows scrubbing backward and forward through stored tick snapshots to review propagation vectors and blocked attempts step-by-step.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#05070a] border-t border-slate-800 flex items-center justify-between text-xs font-mono shrink-0">
          <span className="text-slate-500">
            HomeGuard System Specification v2.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors"
          >
            Close Specification
          </button>
        </div>
      </div>
    </div>
  );
};
