/**
 * HomeGuard - Attack Labs: Live Stochastic Simulation & Mitigation Training
 * Real-time multigraph propagation engine, analyst mid-run intervention (isolate, patch, restrict),
 * hash-chained audit logging, scrubbable tick replay, and AI after-action debrief.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  Award,
  Terminal,
  Clock,
  Sliders,
  Flame,
  XCircle,
  FileText,
  Lock,
  Sparkles,
  Bot,
  Layers,
  ChevronRight,
  AlertTriangle,
  Radio,
  Download,
  Cpu,
  HardDrive,
  TerminalSquare,
  Send,
  CornerDownLeft,
  AlertOctagon,
  Skull,
  CheckCircle2,
} from 'lucide-react';

import {
  NetworkTopology,
  NetworkNode,
  NetworkEdge,
  SimulationScenario,
  SimulationRun,
  TickSnapshot,
  AnalystAction,
  BlockedAttempt,
  AfterActionReport,
  AISecurityBrief,
} from '../types';

interface TerminalLogEntry {
  id: string;
  type: 'attacker' | 'defender' | 'system' | 'blocked';
  text: string;
  timestamp: string;
  cmd?: string;
}

interface AttackLabsPanelProps {
  topology: NetworkTopology;
  onApplyIsolationToGraph?: (isolatedNodeIds: string[]) => void;
}

const PRESET_SCENARIOS: SimulationScenario[] = [
  {
    id: 'scen-01',
    name: 'Ransomware Fast Lateral Spread',
    description: 'High-velocity automated worm propagating across SSH/SMB services towards Core Domain Controller.',
    difficulty: 'HARD',
    entryNodeIds: ['gw-01'],
    targetNodeIds: ['dc-01'],
    aggressiveness: 0.85,
  },
  {
    id: 'scen-02',
    name: 'Cloud Credential & API Exfiltration',
    description: 'Stealthy attacker leveraging unauthenticated HTTP/KubeAPI endpoints to compromise Cloud Storage.',
    difficulty: 'MEDIUM',
    entryNodeIds: ['web-01'],
    targetNodeIds: ['db-01', 'ws-01'],
    aggressiveness: 0.65,
  },
  {
    id: 'scen-03',
    name: 'Zero-Day OT Subnet Infiltration',
    description: 'Evasive multi-hop attack bypassing perimeter firewalls to infiltrate OT Gateway.',
    difficulty: 'CRITICAL',
    entryNodeIds: ['fw-01'],
    targetNodeIds: ['iot-01', 'dc-01'],
    aggressiveness: 0.95,
  },
];

// Cryptographic SHA-256 simulation hash helper
const computeAuditHash = (content: string): string => {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return '0x' + Math.abs(hash).toString(16).padStart(16, '0');
};

export const AttackLabsPanel: React.FC<AttackLabsPanelProps> = ({
  topology,
  onApplyIsolationToGraph,
}) => {
  // Scenario & Configuration State
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>(PRESET_SCENARIOS[0]);
  const [aggressiveness, setAggressiveness] = useState<number>(PRESET_SCENARIOS[0].aggressiveness);
  const [entryNodeIds, setEntryNodeIds] = useState<string[]>(PRESET_SCENARIOS[0].entryNodeIds);
  const [targetNodeIds, setTargetNodeIds] = useState<string[]>(PRESET_SCENARIOS[0].targetNodeIds);
  const [autoTickSpeedMs, setAutoTickSpeedMs] = useState<number>(1200);

  // Live Simulation Run State
  const [isAutoTicking, setIsAutoTicking] = useState<boolean>(false);
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'contained' | 'target-reached' | 'stopped'>('idle');
  const [snapshots, setSnapshots] = useState<TickSnapshot[]>([]);
  const [currentTickIndex, setCurrentTickIndex] = useState<number>(0);

  // Intervention State
  const [isolatedNodeIds, setIsolatedNodeIds] = useState<string[]>([]);
  const [patchedNodeIds, setPatchedNodeIds] = useState<string[]>([]);
  const [restrictedEdgeIds, setRestrictedEdgeIds] = useState<string[]>([]);
  const [analystActions, setAnalystActions] = useState<AnalystAction[]>([]);

  // Selection for Action Dropdowns
  const [actionNodeTarget, setActionNodeTarget] = useState<string>('');
  const [actionEdgeTarget, setActionEdgeTarget] = useState<string>('');

  // Debrief & AI State
  const [report, setReport] = useState<AfterActionReport | null>(null);
  const [isGeneratingAiDebrief, setIsGeneratingAiDebrief] = useState<boolean>(false);

  // Live CLI Terminal Log & Interactive Shell State
  const [terminalLogs, setTerminalLogs] = useState<TerminalLogEntry[]>([
    {
      id: 'init-0',
      type: 'system',
      text: 'HomeGuard Live Attack Simulation & SOC Defender Shell v2.1 initialized.',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'init-1',
      type: 'system',
      text: 'Type commands below (e.g. "isolate gw-01", "patch db-01", "block 3306", "pkill ransomware", "status", "help") or click mitigation pills.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [terminalInput, setTerminalInput] = useState<string>('');
  const [activeTerminalTab, setActiveTerminalTab] = useState<'all' | 'attacker' | 'defender'>('all');
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll terminal to bottom when new logs arrive
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Helper to append terminal logs safely
  const appendTerminalLog = (entry: Omit<TerminalLogEntry, 'id' | 'timestamp'>) => {
    setTerminalLogs((prev) => [
      ...prev,
      {
        ...entry,
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // Auto-tick timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Active snapshot calculated
  const activeSnapshot = useMemo(() => {
    if (snapshots.length === 0) return null;
    return snapshots[Math.min(currentTickIndex, snapshots.length - 1)];
  }, [snapshots, currentTickIndex]);

  // Handle Scenario Switch
  const handleSelectScenario = (scen: SimulationScenario) => {
    setSelectedScenario(scen);
    setAggressiveness(scen.aggressiveness);
    setEntryNodeIds(scen.entryNodeIds);
    setTargetNodeIds(scen.targetNodeIds);
    handleResetSimulation();
  };

  // Initialize or Reset Simulation
  const handleResetSimulation = () => {
    setIsAutoTicking(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const initialSnapshot: TickSnapshot = {
      tick: 0,
      timestamp: new Date().toLocaleTimeString(),
      compromisedNodeIds: [...entryNodeIds],
      newlyCompromisedThisTick: [...entryNodeIds],
      isolatedNodeIds: [],
      patchedNodeIds: [],
      restrictedEdgeIds: [],
      blockedAttempts: [],
      analystActions: [],
      frontierNodeIds: [...entryNodeIds],
    };

    setSnapshots([initialSnapshot]);
    setCurrentTickIndex(0);
    setRunStatus('idle');
    setIsolatedNodeIds([]);
    setPatchedNodeIds([]);
    setRestrictedEdgeIds([]);
    setAnalystActions([]);
    setReport(null);
  };

  // Start Simulation
  const handleStartSimulation = () => {
    if (runStatus === 'idle') {
      const initialSnapshot: TickSnapshot = {
        tick: 0,
        timestamp: new Date().toLocaleTimeString(),
        compromisedNodeIds: [...entryNodeIds],
        newlyCompromisedThisTick: [...entryNodeIds],
        isolatedNodeIds: [],
        patchedNodeIds: [],
        restrictedEdgeIds: [],
        blockedAttempts: [],
        analystActions: [],
        frontierNodeIds: [...entryNodeIds],
      };
      setSnapshots([initialSnapshot]);
      setCurrentTickIndex(0);
    }
    setRunStatus('running');
    setIsAutoTicking(true);
  };

  // Advance Simulation by 1 Tick
  const advanceTick = () => {
    if (runStatus === 'contained' || runStatus === 'target-reached' || runStatus === 'stopped') {
      setIsAutoTicking(false);
      return;
    }

    setSnapshots((prevSnapshots) => {
      const last = prevSnapshots[prevSnapshots.length - 1];
      if (!last) return prevSnapshots;

      const currentTick = last.tick + 1;
      const currentCompromised = new Set(last.compromisedNodeIds);
      const newlyCompromised: string[] = [];
      const blocked: BlockedAttempt[] = [];

      // Find outbound edges from all currently compromised nodes
      const activeOutboundEdges = topology.edges.filter(
        (e) => currentCompromised.has(e.source) && !currentCompromised.has(e.target)
      );

      for (const edge of activeOutboundEdges) {
        const sourceNode = topology.nodes.find((n) => n.id === edge.source);
        const targetNode = topology.nodes.find((n) => n.id === edge.target);
        if (!sourceNode || !targetNode) continue;

        // 1. Check if edge is restricted
        if (restrictedEdgeIds.includes(edge.id)) {
          blocked.push({
            edgeId: edge.id,
            sourceNodeId: sourceNode.id,
            sourceNodeName: sourceNode.name,
            targetNodeId: targetNode.id,
            targetNodeName: targetNode.name,
            reason: 'Edge Restricted',
            rollValue: 0,
            threshold: 0,
          });
          continue;
        }

        // 2. Check if target or source node is isolated
        if (isolatedNodeIds.includes(targetNode.id) || isolatedNodeIds.includes(sourceNode.id)) {
          blocked.push({
            edgeId: edge.id,
            sourceNodeId: sourceNode.id,
            sourceNodeName: sourceNode.name,
            targetNodeId: targetNode.id,
            targetNodeName: targetNode.name,
            reason: 'Isolated Node',
            rollValue: 0,
            threshold: 0,
          });
          continue;
        }

        // 3. Compute propagation probability threshold
        // Formula: f(risk_weight, exploitability, auth_required, aggressiveness)
        let baseProb = edge.exploitability * aggressiveness * (edge.authRequired ? 0.70 : 1.0);

        // If target node is patched, reduce probability by 75%
        if (patchedNodeIds.includes(targetNode.id)) {
          baseProb *= 0.25;
        }

        // Roll pseudo-random stochastic transition
        const roll = Math.random();

        if (roll < baseProb) {
          if (!currentCompromised.has(targetNode.id) && !newlyCompromised.includes(targetNode.id)) {
            newlyCompromised.push(targetNode.id);
            // Append live attacker CLI exploit log
            const exploitCmds = [
              `nmap -sS -p ${edge.port} ${targetNode.ip} --open`,
              `hydra -l admin -P /usr/share/wordlists/passwords.txt ${targetNode.ip} ${edge.protocol.toLowerCase()} -t 4`,
              `impacket-psexec administrator@${targetNode.ip} -hashes :31d6cfe0d16ae931b73c59d7e0c089c0`,
              `sqlmap -u "http://${targetNode.ip}:${edge.port}/api?id=1" --batch --dump`,
              `stdbuf -o0 ./ransomware_payload --target ${targetNode.id} --path /data/db`,
            ];
            const chosenCmd = exploitCmds[Math.floor(Math.random() * exploitCmds.length)];
            appendTerminalLog({
              type: 'attacker',
              cmd: chosenCmd,
              text: `[ATTACKER] Executed exploit on ${targetNode.name} (${targetNode.ip}) via ${edge.protocol}:${edge.port} -> EXPLOIT SUCCESSFUL (Node Compromised)`,
            });
          }
        } else {
          const reasonText = patchedNodeIds.includes(targetNode.id) ? 'Patched Defense' : 'Stochastic Shield Roll';
          blocked.push({
            edgeId: edge.id,
            sourceNodeId: sourceNode.id,
            sourceNodeName: sourceNode.name,
            targetNodeId: targetNode.id,
            targetNodeName: targetNode.name,
            reason: reasonText,
            rollValue: Math.round(roll * 100) / 100,
            threshold: Math.round(baseProb * 100) / 100,
          });

          appendTerminalLog({
            type: 'blocked',
            cmd: `firewall-check --source ${sourceNode.ip} --target ${targetNode.ip} --port ${edge.port}`,
            text: `[DEFENSE BLOCKED] Lateral movement ${sourceNode.name} ➔ ${targetNode.name} (${edge.protocol}:${edge.port}) blocked by: ${reasonText}`,
          });
        }
      }

      // Update total compromised set
      const updatedCompromisedList = Array.from(
        new Set([...last.compromisedNodeIds, ...newlyCompromised])
      );

      // Check Termination Conditions
      const targetReached = targetNodeIds.some((tId) => updatedCompromisedList.includes(tId));
      const isContained = newlyCompromised.length === 0 && !targetReached;

      const newSnapshot: TickSnapshot = {
        tick: currentTick,
        timestamp: new Date().toLocaleTimeString(),
        compromisedNodeIds: updatedCompromisedList,
        newlyCompromisedThisTick: newlyCompromised,
        isolatedNodeIds: [...isolatedNodeIds],
        patchedNodeIds: [...patchedNodeIds],
        restrictedEdgeIds: [...restrictedEdgeIds],
        blockedAttempts: blocked,
        analystActions: [...analystActions],
        frontierNodeIds: activeOutboundEdges.map((e) => e.target),
      };

      const updatedSnapshots = [...prevSnapshots, newSnapshot];
      setCurrentTickIndex(updatedSnapshots.length - 1);

      if (targetReached) {
        setRunStatus('target-reached');
        setIsAutoTicking(false);
        generateAfterActionReport(updatedSnapshots, true);
      } else if (isContained || currentTick >= 20) {
        setRunStatus('contained');
        setIsAutoTicking(false);
        generateAfterActionReport(updatedSnapshots, false);
      } else {
        setRunStatus('running');
      }

      return updatedSnapshots;
    });
  };

  // Auto-tick effect handler
  useEffect(() => {
    if (isAutoTicking && (runStatus === 'running' || runStatus === 'idle')) {
      timerRef.current = setInterval(() => {
        advanceTick();
      }, autoTickSpeedMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoTicking, runStatus, autoTickSpeedMs, isolatedNodeIds, patchedNodeIds, restrictedEdgeIds, aggressiveness]);

  // Mid-run Analyst Interventions (Isolate, Patch, Restrict Edge)
  const handleApplyAnalystAction = (type: 'isolate' | 'patch' | 'restrict_edge', targetId: string) => {
    if (!targetId) return;

    let targetName = targetId;
    if (type === 'isolate' || type === 'patch') {
      const node = topology.nodes.find((n) => n.id === targetId);
      if (node) targetName = `${node.name} (${node.ip})`;
    } else {
      const edge = topology.edges.find((e) => e.id === targetId);
      if (edge) targetName = `${edge.source} ➔ ${edge.target} (${edge.protocol}:${edge.port})`;
    }

    const prevHash = analystActions.length > 0 ? analystActions[analystActions.length - 1].hash : '0000000000000000';
    const timestamp = new Date().toLocaleTimeString();
    const token = `ACT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const tickNow = activeSnapshot ? activeSnapshot.tick : 0;
    const rawContent = `${prevHash}|${timestamp}|Analyst-SOC-01|${type}|${targetId}|${token}`;
    const hash = computeAuditHash(rawContent);

    const newAction: AnalystAction = {
      id: `act-${Date.now()}`,
      actionType: type,
      targetId,
      targetName,
      tickApplied: tickNow,
      analystId: 'Analyst-SOC-01 (Lead)',
      timestamp,
      token,
      hash,
      previousHash: prevHash,
    };

    setAnalystActions((prev) => [...prev, newAction]);

    if (type === 'isolate') {
      setIsolatedNodeIds((prev) => {
        const updated = [...new Set([...prev, targetId])];
        if (onApplyIsolationToGraph) onApplyIsolationToGraph(updated);
        return updated;
      });
      appendTerminalLog({
        type: 'defender',
        cmd: `iptables -A INPUT -s ${targetId} -j DROP && ip link set dev eth-${targetId} down`,
        text: `[SOC-DEFENDER] QUARANTINED & ISOLATED ASSET: ${targetName}. Traffic severed on all interface ports.`,
      });
    } else if (type === 'patch') {
      setPatchedNodeIds((prev) => [...new Set([...prev, targetId])]);
      appendTerminalLog({
        type: 'defender',
        cmd: `./apply_hotfix.sh --target ${targetId} --cve CVE-2024-38077 --restart-service`,
        text: `[SOC-DEFENDER] EMERGENCY SECURITY PATCH APPLIED: ${targetName}. Exploitability probability reduced by 75%.`,
      });
    } else if (type === 'restrict_edge') {
      setRestrictedEdgeIds((prev) => [...new Set([...prev, targetId])]);
      appendTerminalLog({
        type: 'defender',
        cmd: `ufw deny out on eth0 to ${targetName}`,
        text: `[SOC-DEFENDER] PROTOCOL EDGE RESTRICTED: ${targetName}. Inter-subnet route blocked in firewall rules.`,
      });
    }

    // Reset dropdowns
    setActionNodeTarget('');
    setActionEdgeTarget('');
  };

  // Interactive Defender Shell CLI Parser
  const handleExecuteDefenderCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    appendTerminalLog({
      type: 'defender',
      cmd: trimmed,
      text: `SOC-Defender@homeguard:~$ ${trimmed}`,
    });

    const parts = trimmed.split(' ');
    const verb = parts[0].toLowerCase();
    const arg1 = parts[1] ? parts[1].trim() : '';

    if (verb === 'clear') {
      setTerminalLogs([]);
      setTerminalInput('');
      return;
    }

    if (verb === 'help') {
      appendTerminalLog({
        type: 'system',
        text: `AVAILABLE SOC COMMANDS:
  • isolate <node_id>   : Quarantine asset (e.g. "isolate gw-01")
  • patch <node_id>     : Apply CVE emergency patch (e.g. "patch db-01")
  • block <port>        : Restrict protocol port across network (e.g. "block 3306")
  • restrict <edge_id>  : Block specific edge path (e.g. "restrict edge-1")
  • pkill <process>     : Terminate ransomware or miner process (e.g. "pkill ransomware")
  • status              : Display cluster health breakdown & compromised count
  • clear               : Clear terminal log history`,
      });
      setTerminalInput('');
      return;
    }

    if (verb === 'status') {
      const compCount = activeSnapshot ? activeSnapshot.compromisedNodeIds.length : entryNodeIds.length;
      appendTerminalLog({
        type: 'system',
        text: `[STATUS CHECK]
  Active Scenario: ${selectedScenario.name} (${selectedScenario.difficulty})
  Total Nodes: ${topology.nodes.length} | Compromised: ${compCount} | Isolated: ${isolatedNodeIds.length} | Patched: ${patchedNodeIds.length}
  Current Simulation Tick: ${activeSnapshot?.tick || 0}`,
      });
      setTerminalInput('');
      return;
    }

    if (verb === 'isolate' || verb === 'quarantine') {
      if (!arg1) {
        appendTerminalLog({ type: 'system', text: 'Usage: isolate <node_id> (e.g. "isolate gw-01")' });
      } else {
        const matched = topology.nodes.find((n) => n.id.toLowerCase() === arg1.toLowerCase() || n.name.toLowerCase().includes(arg1.toLowerCase()));
        if (matched) {
          handleApplyAnalystAction('isolate', matched.id);
        } else {
          appendTerminalLog({ type: 'system', text: `Node "${arg1}" not found in current topology.` });
        }
      }
      setTerminalInput('');
      return;
    }

    if (verb === 'patch' || verb === 'hotfix') {
      if (!arg1) {
        appendTerminalLog({ type: 'system', text: 'Usage: patch <node_id> (e.g. "patch db-01")' });
      } else {
        const matched = topology.nodes.find((n) => n.id.toLowerCase() === arg1.toLowerCase() || n.name.toLowerCase().includes(arg1.toLowerCase()));
        if (matched) {
          handleApplyAnalystAction('patch', matched.id);
        } else {
          appendTerminalLog({ type: 'system', text: `Node "${arg1}" not found in current topology.` });
        }
      }
      setTerminalInput('');
      return;
    }

    if (verb === 'block' || verb === 'restrict' || verb === 'ufw') {
      if (!arg1) {
        appendTerminalLog({ type: 'system', text: 'Usage: block <port> or restrict <edge_id> (e.g. "block 3306")' });
      } else {
        // Find matching edges by port or id
        const matchedEdge = topology.edges.find((e) => e.port.toString() === arg1 || e.id === arg1);
        if (matchedEdge) {
          handleApplyAnalystAction('restrict_edge', matchedEdge.id);
        } else {
          // If port matches multiple edges, restrict all matching port edges
          const portEdges = topology.edges.filter((e) => e.port.toString() === arg1);
          if (portEdges.length > 0) {
            portEdges.forEach((e) => handleApplyAnalystAction('restrict_edge', e.id));
          } else {
            appendTerminalLog({ type: 'system', text: `No active protocol edge matching port/id "${arg1}".` });
          }
        }
      }
      setTerminalInput('');
      return;
    }

    if (verb === 'pkill' || verb === 'kill') {
      appendTerminalLog({
        type: 'defender',
        cmd: `pkill -9 -f ${arg1 || 'ransomware'}`,
        text: `[SOC-DEFENDER] Terminated malicious execution thread "${arg1 || 'ransomware'}". Host CPU load stabilized.`,
      });
      setTerminalInput('');
      return;
    }

    // Default response for unrecognized commands
    appendTerminalLog({
      type: 'system',
      text: `Command "${verb}" unrecognized. Type "help" to view allowed commands.`,
    });
    setTerminalInput('');
  };

  // Generate Scorecard and After-Action Report (F36-F37)
  const generateAfterActionReport = async (finalSnapshots: TickSnapshot[], targetReached: boolean) => {
    const totalNodes = topology.nodes.length;
    const endSnapshot = finalSnapshots[finalSnapshots.length - 1];
    const compromisedCount = endSnapshot.compromisedNodeIds.length;
    const ticksElapsed = endSnapshot.tick;

    const containmentScore = Math.max(0, 1 - compromisedCount / totalNodes);
    const speedBonus = Math.max(0, 1 - ticksElapsed / 15);
    const targetPenalty = targetReached ? 0.5 : 0;

    const rawScore = 0.6 * containmentScore + 0.4 * speedBonus - targetPenalty;
    const finalScorePct = Math.round(Math.min(1, Math.max(0, rawScore)) * 100);

    let grade: 'S' | 'A' | 'B' | 'C' | 'F' = 'F';
    if (finalScorePct >= 90) grade = 'S';
    else if (finalScorePct >= 78) grade = 'A';
    else if (finalScorePct >= 65) grade = 'B';
    else if (finalScorePct >= 50) grade = 'C';

    const criticalIntervention = analystActions.length > 0 ? analystActions[0] : undefined;

    // AI Debrief Fallback
    const fallbackBrief: AISecurityBrief = {
      summary: `[ATTACK LABS DEBRIEF] Scenario '${selectedScenario.name}' concluded after ${ticksElapsed} tick(s). Final Containment Score: ${finalScorePct}% (Grade ${grade}). Total nodes compromised: ${compromisedCount}/${totalNodes}. Target Crown Jewel status: ${targetReached ? 'CRITICAL BREACH' : 'CONTAINED / PROTECTED'}.`,
      attackVectorAnalysis: `Attacker initial entry at [${entryNodeIds.join(', ')}] propagated through network hops. ${analystActions.length} analyst intervention(s) were logged on the hash chain during the run.`,
      criticalChokepoints: [
        `Key chokepoints quarantined: ${isolatedNodeIds.length > 0 ? isolatedNodeIds.map(id => `[${id}]`).join(', ') : 'None'}`,
        `Services restricted: ${restrictedEdgeIds.length} multigraph protocols blocked.`,
      ],
      recommendedPlaybook: {
        immediate: [
          `Maintain isolation on [${isolatedNodeIds.join(', ') || 'quarantined assets'}]`,
          `Verify integrity of Domain Controller [${targetNodeIds.join(', ')}]`,
        ],
        shortTerm: [
          `Enforce microsegmentation policies on entry hosts [${entryNodeIds.join(', ')}]`,
        ],
        strategic: [
          `Deploy automated Attack Labs playbooks for zero-trust microsegmentation response.`,
        ],
      },
      threatLevel: targetReached ? 'CRITICAL' : 'LOW',
    };

    const newReport: AfterActionReport = {
      runId: `RUN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      containmentScore: Math.round(containmentScore * 100) / 100,
      speedBonus: Math.round(speedBonus * 100) / 100,
      targetPenalty,
      finalScorePercentage: finalScorePct,
      grade,
      nodesCompromisedCount: compromisedCount,
      totalNodesCount: totalNodes,
      timeToContainmentTicks: ticksElapsed,
      targetReached,
      criticalIntervention,
      aiDebrief: fallbackBrief,
    };

    setReport(newReport);

    // Call server Gemini endpoint for AI Debrief enrichment if available
    setIsGeneratingAiDebrief(true);
    try {
      const res = await fetch('/api/gemini/threat-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Generate an executive After-Action Debrief for Attack Labs scenario '${selectedScenario.name}'. Total nodes: ${totalNodes}, Compromised: ${compromisedCount}, Ticks: ${ticksElapsed}, Target Breached: ${targetReached}. Analyst actions: ${analystActions.map(a => `${a.actionType} on ${a.targetId}`).join(', ')}. Include node ID citations in brackets e.g. [gw-01].`,
        }),
      });
      const data = await res.json();
      if (data.answer) {
        setReport((prev) =>
          prev
            ? {
                ...prev,
                aiDebrief: {
                  ...prev.aiDebrief,
                  summary: data.answer.substring(0, 320) + '...',
                  attackVectorAnalysis: data.answer,
                },
              }
            : null
        );
      }
    } catch (err) {
      console.warn('AI Debrief server call notice - using fallback brief:', err);
    } finally {
      setIsGeneratingAiDebrief(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#070b12] text-slate-200 font-sans">
      {/* Top Controls Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shrink-0 shadow-lg">
        {/* Scenario Selector & Info */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-red-950/80 to-purple-950/80 px-3 py-1.5 rounded-xl border border-red-800/60 shadow-inner">
            <Flame className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="font-mono text-xs font-bold text-red-300 uppercase tracking-wider">Attack Labs v2.1</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-mono">Scenario:</span>
            <select
              value={selectedScenario.id}
              onChange={(e) => {
                const scen = PRESET_SCENARIOS.find((s) => s.id === e.target.value);
                if (scen) handleSelectScenario(scen);
              }}
              className="bg-transparent text-cyan-300 font-bold outline-none cursor-pointer"
            >
              {PRESET_SCENARIOS.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                  {s.name} ({s.difficulty})
                </option>
              ))}
            </select>
          </div>

          {/* Aggressiveness Slider */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Aggressiveness:</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={aggressiveness}
              onChange={(e) => setAggressiveness(parseFloat(e.target.value))}
              className="w-20 accent-red-500 cursor-pointer"
            />
            <span className="font-bold text-red-400 w-8">{(aggressiveness * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Simulation Runner Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {runStatus === 'idle' || runStatus === 'stopped' ? (
            <button
              onClick={handleStartSimulation}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Live Simulation</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAutoTicking(!isAutoTicking)}
              className={`flex items-center gap-2 px-4 py-2 font-bold rounded-xl shadow-lg transition-all active:scale-95 ${
                isAutoTicking
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isAutoTicking ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isAutoTicking ? 'Pause Auto-Tick' : 'Resume Auto-Tick'}</span>
            </button>
          )}

          <button
            onClick={advanceTick}
            disabled={runStatus === 'contained' || runStatus === 'target-reached'}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-300 font-bold rounded-xl border border-slate-700 transition-all active:scale-95"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Advance 1 Tick</span>
          </button>

          <button
            onClick={handleResetSimulation}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Bar Indicator Banner */}
      <div className="px-6 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Simulation Status:</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                runStatus === 'running'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse'
                  : runStatus === 'target-reached'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : runStatus === 'contained'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {runStatus.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Tick:</span>
            <span className="font-bold text-white text-sm">{activeSnapshot ? activeSnapshot.tick : 0}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-slate-400">Compromised Assets:</span>
            <span className="font-bold text-red-400">
              {activeSnapshot ? activeSnapshot.compromisedNodeIds.length : entryNodeIds.length} / {topology.nodes.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Target Crown Jewels:</span>
          <span className="font-bold text-amber-400">{targetNodeIds.join(', ')}</span>
        </div>
      </div>

      {/* Main Workspace Split Layout */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        {/* Left / Center Column: Real-time Visual Propagation Canvas & Replay Scrubber */}
        <div className="flex-1 flex flex-col p-4 bg-[#05080f] overflow-y-auto space-y-4">
          {/* Node Propagation Visual Map */}
          <div className="bg-[#0a0f18] rounded-2xl border border-slate-800/80 p-5 shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h3 className="text-xs font-bold font-mono text-white tracking-wider uppercase">
                  Real-Time Stochastic Propagation Canvas
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Newly Compromised: <span className="text-rose-400 font-bold">{activeSnapshot?.newlyCompromisedThisTick.length || 0}</span>
              </span>
            </div>

            {/* Topology Node Grid Visualization with Asset Damage Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 font-mono text-xs">
              {topology.nodes.map((node) => {
                const isCompromised = activeSnapshot?.compromisedNodeIds.includes(node.id);
                const isNewlyCompromised = activeSnapshot?.newlyCompromisedThisTick.includes(node.id);
                const isTarget = targetNodeIds.includes(node.id);
                const isEntry = entryNodeIds.includes(node.id);
                const isIsolated = isolatedNodeIds.includes(node.id);
                const isPatched = patchedNodeIds.includes(node.id);

                // Compute Node Integrity / Damage percentage
                let integrityPct = 100;
                let damageStatusLabel = 'HEALTHY';
                let cpuLoadPct = Math.floor(Math.random() * 15) + 5;

                if (isCompromised) {
                  if (isTarget) {
                    integrityPct = 0;
                    damageStatusLabel = 'DATA ENCRYPTED';
                    cpuLoadPct = 99;
                  } else if (isNewlyCompromised) {
                    integrityPct = 40;
                    damageStatusLabel = 'UNDER ATTACK';
                    cpuLoadPct = 88;
                  } else {
                    integrityPct = 20;
                    damageStatusLabel = 'RAMSOMWARE MINER';
                    cpuLoadPct = 95;
                  }
                } else if (isPatched) {
                  integrityPct = 100;
                  damageStatusLabel = 'PATCH SECURED';
                  cpuLoadPct = 12;
                } else if (isIsolated) {
                  integrityPct = 100;
                  damageStatusLabel = 'QUARANTINED';
                  cpuLoadPct = 4;
                }

                return (
                  <div
                    key={node.id}
                    className={`p-3 rounded-xl border transition-all duration-300 relative flex flex-col justify-between ${
                      isNewlyCompromised
                        ? 'bg-rose-950/90 border-rose-500 shadow-lg shadow-rose-950/80 scale-[1.02] ring-2 ring-rose-400 animate-pulse'
                        : isCompromised
                        ? 'bg-red-950/60 border-red-800 text-red-200'
                        : isIsolated
                        ? 'bg-blue-950/40 border-blue-800/70 text-blue-300 opacity-70'
                        : isTarget
                        ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[11px] text-white truncate max-w-[120px]">{node.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-400">
                          {node.id}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 space-y-0.5 mb-2">
                        <div>IP: {node.ip}</div>
                        <div>Type: {node.type}</div>
                      </div>

                      {/* Health Integrity Bar & Damage Metrics */}
                      <div className="my-2 p-2 bg-slate-950/80 rounded-lg border border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-bold">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Cpu className="w-3 h-3 text-cyan-400" /> Integrity:
                          </span>
                          <span
                            className={
                              integrityPct > 70
                                ? 'text-emerald-400'
                                : integrityPct > 30
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }
                          >
                            {integrityPct}% ({damageStatusLabel})
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full transition-all duration-500 ${
                              integrityPct > 70
                                ? 'bg-emerald-500'
                                : integrityPct > 30
                                ? 'bg-amber-500'
                                : 'bg-rose-500 animate-pulse'
                            }`}
                            style={{ width: `${integrityPct}%` }}
                          />
                        </div>
                        {isCompromised && (
                          <div className="flex items-center justify-between text-[8px] text-rose-300 pt-0.5">
                            <span>CPU Spike: {cpuLoadPct}%</span>
                            <span className="text-amber-300">Memory Corrupted</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      {isCompromised && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800 font-bold flex items-center gap-0.5">
                          <Skull className="w-2.5 h-2.5 text-rose-400" /> COMPROMISED
                        </span>
                      )}
                      {isEntry && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                          ENTRY
                        </span>
                      )}
                      {isTarget && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                          TARGET
                        </span>
                      )}
                      {isIsolated && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold flex items-center gap-0.5">
                          <Shield className="w-2.5 h-2.5" /> ISOLATED
                        </span>
                      )}
                      {isPatched && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> PATCHED
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Interactive CLI Terminal Shell */}
          <div className="bg-[#080d16] rounded-2xl border border-slate-800 p-4 shadow-2xl space-y-3 font-mono text-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <TerminalSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Attack & Defender Command Terminal Shell
                </h3>
              </div>

              {/* Terminal Log Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
                <button
                  onClick={() => setActiveTerminalTab('all')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeTerminalTab === 'all'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Logs ({terminalLogs.length})
                </button>
                <button
                  onClick={() => setActiveTerminalTab('attacker')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeTerminalTab === 'attacker'
                      ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Attacker Red Stream
                </button>
                <button
                  onClick={() => setActiveTerminalTab('defender')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeTerminalTab === 'defender'
                      ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  SOC Defender Shell
                </button>
              </div>
            </div>

            {/* Terminal Screen Window */}
            <div className="p-3 bg-black/90 rounded-xl border border-slate-900 font-mono text-[11px] h-48 overflow-y-auto space-y-2 shadow-inner">
              {terminalLogs
                .filter((l) => {
                  if (activeTerminalTab === 'attacker') return l.type === 'attacker';
                  if (activeTerminalTab === 'defender') return l.type === 'defender' || l.type === 'system';
                  return true;
                })
                .map((log) => (
                  <div key={log.id} className="space-y-0.5">
                    {log.cmd && (
                      <div className="text-cyan-400 font-bold flex items-center gap-1.5 opacity-90">
                        <span className="text-slate-600">$</span>
                        <code>{log.cmd}</code>
                      </div>
                    )}
                    <div
                      className={`leading-relaxed ${
                        log.type === 'attacker'
                          ? 'text-rose-400 font-semibold'
                          : log.type === 'defender'
                          ? 'text-emerald-300 font-semibold'
                          : log.type === 'blocked'
                          ? 'text-amber-300'
                          : 'text-slate-400 italic'
                      }`}
                    >
                      <span className="text-[9px] text-slate-600 mr-2">[{log.timestamp}]</span>
                      {log.text}
                    </div>
                  </div>
                ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Quick Action Command Badges */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="text-slate-400">Quick Mitigation Shell:</span>
              <button
                onClick={() => handleExecuteDefenderCommand(`isolate ${entryNodeIds[0] || 'gw-01'}`)}
                className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded font-mono transition-all"
              >
                $ isolate {entryNodeIds[0] || 'gw-01'}
              </button>
              <button
                onClick={() => handleExecuteDefenderCommand(`patch ${targetNodeIds[0] || 'db-01'}`)}
                className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded font-mono transition-all"
              >
                $ patch {targetNodeIds[0] || 'db-01'}
              </button>
              <button
                onClick={() => handleExecuteDefenderCommand('block 3306')}
                className="px-2 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded font-mono transition-all"
              >
                $ ufw deny 3306
              </button>
              <button
                onClick={() => handleExecuteDefenderCommand('pkill ransomware')}
                className="px-2 py-1 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 rounded font-mono transition-all"
              >
                $ pkill -9 ransomware
              </button>
              <button
                onClick={() => handleExecuteDefenderCommand('status')}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded font-mono transition-all"
              >
                $ status
              </button>
              <button
                onClick={() => handleExecuteDefenderCommand('help')}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 rounded font-mono transition-all"
              >
                $ help
              </button>
            </div>

            {/* Interactive Command Prompt Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteDefenderCommand(terminalInput);
              }}
              className="flex items-center gap-2 bg-black border border-slate-800 rounded-xl p-2"
            >
              <span className="text-emerald-400 font-bold pl-2 flex items-center gap-1">
                <CornerDownLeft className="w-3.5 h-3.5" /> SOC-Defender@homeguard:~$
              </span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="Type command e.g. isolate gw-01, patch db-01, block 3306, status, help..."
                className="flex-1 bg-transparent text-slate-200 outline-none text-xs font-mono placeholder:text-slate-600"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all"
              >
                <Send className="w-3 h-3" />
                <span>Run</span>
              </button>
            </form>
          </div>

          {/* Tick Replay Scrubbing Timeline Slider (F38) */}
          <div className="bg-[#0a0f18] rounded-2xl border border-slate-800/80 p-4 shadow-xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Clock className="w-4 h-4" />
                <span>Historical Tick Replay Scrubber (F38)</span>
              </div>
              <span className="text-slate-400 text-[11px]">
                Viewing Tick {currentTickIndex} / {snapshots.length > 0 ? snapshots.length - 1 : 0}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max={snapshots.length > 0 ? snapshots.length - 1 : 0}
              value={currentTickIndex}
              onChange={(e) => setCurrentTickIndex(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Blocked Attacks Log for Current Tick */}
          <div className="bg-[#0a0f18] rounded-2xl border border-slate-800/80 p-4 shadow-xl space-y-2 font-mono text-xs">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Blocked Lateral Movement Attempts at Tick {activeSnapshot?.tick || 0}</span>
            </h4>
            {activeSnapshot?.blockedAttempts && activeSnapshot.blockedAttempts.length > 0 ? (
              <div className="space-y-1 max-h-36 overflow-y-auto text-[11px]">
                {activeSnapshot.blockedAttempts.map((b, i) => (
                  <div key={i} className="p-2 bg-slate-950 rounded border border-slate-900 flex items-center justify-between text-slate-400">
                    <span>
                      <strong className="text-slate-200">{b.sourceNodeName}</strong> ➔ <strong className="text-slate-200">{b.targetNodeName}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold text-[10px]">
                      {b.reason}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">No blocked propagation attempts recorded on this tick.</p>
            )}
          </div>
        </div>

        {/* Right Column: Analyst Mid-Run Interventions, Audit Log & After-Action Report */}
        <div className="w-full xl:w-[480px] p-4 bg-[#080d16] border-t xl:border-t-0 xl:border-l border-slate-800 overflow-y-auto space-y-4 shrink-0 font-mono text-xs">
          {/* Analyst Intervention Controls (F34-F35) */}
          <div className="bg-[#0c121e] rounded-2xl border border-purple-900/40 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-purple-900/30 pb-3">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Analyst Mid-Run Interventions</h3>
                <p className="text-[10px] text-purple-300/70">Execute live containment on active simulation state</p>
              </div>
            </div>

            {/* Isolate Node Control */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. Quarantine & Isolate Asset</span>
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={actionNodeTarget}
                  onChange={(e) => setActionNodeTarget(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                >
                  <option value="">Select Asset Node...</option>
                  {topology.nodes.map((n) => (
                    <option key={n.id} value={n.id} className="bg-slate-900">
                      {n.name} ({n.id}) - {isolatedNodeIds.includes(n.id) ? '[ISOLATED]' : 'Active'}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleApplyAnalystAction('isolate', actionNodeTarget)}
                  disabled={!actionNodeTarget}
                  className="px-3 py-2 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 text-white font-bold rounded-lg transition-colors"
                >
                  Isolate
                </button>
              </div>
            </div>

            {/* Patch Node Control */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Apply Emergency Patch (Reduces Exploitability by 75%)</span>
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={actionNodeTarget}
                  onChange={(e) => setActionNodeTarget(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                >
                  <option value="">Select Asset Node...</option>
                  {topology.nodes.map((n) => (
                    <option key={n.id} value={n.id} className="bg-slate-900">
                      {n.name} ({n.id})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleApplyAnalystAction('patch', actionNodeTarget)}
                  disabled={!actionNodeTarget}
                  className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold rounded-lg transition-colors"
                >
                  Patch
                </button>
              </div>
            </div>

            {/* Restrict Edge Control */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>3. Restrict Specific Protocol Edge</span>
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={actionEdgeTarget}
                  onChange={(e) => setActionEdgeTarget(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                >
                  <option value="">Select Protocol Edge...</option>
                  {topology.edges.map((e) => (
                    <option key={e.id} value={e.id} className="bg-slate-900">
                      {e.source} ➔ {e.target} ({e.protocol}:{e.port})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleApplyAnalystAction('restrict_edge', actionEdgeTarget)}
                  disabled={!actionEdgeTarget}
                  className="px-3 py-2 bg-rose-700 hover:bg-rose-600 disabled:opacity-40 text-white font-bold rounded-lg transition-colors"
                >
                  Restrict
                </button>
              </div>
            </div>
          </div>

          {/* Hash-Chained Audit Trail Log of Interventions */}
          <div className="bg-[#0c121e] rounded-2xl border border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Hash-Chained Intervention Log</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                ✓ Logged: {analystActions.length}
              </span>
            </div>

            {analystActions.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto text-[10px]">
                {analystActions.map((act) => (
                  <div key={act.id} className="p-2 bg-slate-950 rounded border border-slate-900 space-y-1">
                    <div className="flex items-center justify-between text-purple-300 font-bold">
                      <span>[{act.actionType.toUpperCase()}] {act.targetName}</span>
                      <span>Tick {act.tickApplied}</span>
                    </div>
                    <div className="text-[9px] text-slate-500 flex justify-between">
                      <span>Hash: {act.hash.substring(0, 10)}...</span>
                      <span>{act.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic p-2 text-center">No analyst interventions logged yet during this run.</p>
            )}
          </div>

          {/* After-Action Report & AI Debrief Panel (F36-F37) */}
          {report && (
            <div className="bg-gradient-to-b from-[#0e1726] to-[#070b12] border border-cyan-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">After-Action Scorecard</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-cyan-300 font-mono">{report.grade}</span>
                  <span className="text-xs text-slate-400">({report.finalScorePercentage}%)</span>
                </div>
              </div>

              {/* Score Breakdown Metrics */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Containment Ratio</span>
                  <strong className="text-emerald-400 text-xs">{(report.containmentScore * 100).toFixed(0)}%</strong>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Speed Bonus</span>
                  <strong className="text-cyan-400 text-xs">{(report.speedBonus * 100).toFixed(0)}%</strong>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Target Breached</span>
                  <strong className={report.targetReached ? 'text-rose-400 text-xs' : 'text-emerald-400 text-xs'}>
                    {report.targetReached ? 'YES (-50%)' : 'NO (SAFE)'}
                  </strong>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Ticks to Contain</span>
                  <strong className="text-purple-400 text-xs">{report.timeToContainmentTicks} ticks</strong>
                </div>
              </div>

              {/* AI Debrief */}
              <div className="space-y-2 border-t border-slate-800 pt-3 text-[11px]">
                <div className="flex items-center justify-between text-purple-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Gemini AI After-Action Debrief</span>
                  </span>
                  {isGeneratingAiDebrief && <span className="text-[9px] text-cyan-400 animate-pulse">Generating...</span>}
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-purple-900/30 text-slate-300 space-y-2 leading-relaxed">
                  <p className="font-semibold text-white">{report.aiDebrief.summary}</p>
                  <p className="text-slate-400 text-[10px]">{report.aiDebrief.attackVectorAnalysis}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
