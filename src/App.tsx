/**
 * HomeGuard - Main Application Container
 * Immersive Cyber AI Ops UI Theme
 */

import React, { useState, useMemo } from 'react';
import { Zap, CheckCircle2, X, ShieldAlert } from 'lucide-react';
import { NetworkTopology, AttackPath, NetworkNode } from './types';
import { TOPOLOGY_PRESETS } from './data/topologyPresets';
import { analyzeAndRankAttackPaths } from './utils/attackRiskEngine';
import { Navbar } from './components/Navbar';
import { GraphCanvas } from './components/GraphCanvas';
import { AlgorithmsPanel } from './components/AlgorithmsPanel';
import { MLModelPanel } from './components/MLModelPanel';
import { RemediationPanel } from './components/RemediationPanel';
import { CopilotPanel } from './components/CopilotPanel';
import { AttackLabsPanel } from './components/AttackLabsPanel';
import { ImportExportModal } from './components/ImportExportModal';
import { SecurityAuditorModal } from './components/SecurityAuditorModal';

export const App: React.FC = () => {
  const [currentTopology, setCurrentTopology] = useState<NetworkTopology>(
    TOPOLOGY_PRESETS[0]
  );

  const [activeTab, setActiveTab] = useState<
    'graph' | 'algorithms' | 'ml' | 'remediation' | 'copilot' | 'attack-labs'
  >('graph');

  // Simulation Overlay State
  const [compromisedNodeIds, setCompromisedNodeIds] = useState<string[]>([
    'gw-01',
  ]);
  const [targetNodeIds, setTargetNodeIds] = useState<string[]>(['dc-01']);
  const [isolatedNodeIds, setIsolatedNodeIds] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [selectedPath, setSelectedPath] = useState<AttackPath | null>(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isAuditorOpen, setIsAuditorOpen] = useState(false);

  // Analysis Feedback States
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState(false);
  const [analysisToast, setAnalysisToast] = useState<{
    message: string;
    type: 'success' | 'warning' | 'info';
  } | null>(null);

  // Compute Ranked Attack Paths on the fly using attackRiskEngine
  const rankedPaths = useMemo(() => {
    return analyzeAndRankAttackPaths(
      currentTopology,
      compromisedNodeIds,
      targetNodeIds,
      isolatedNodeIds
    );
  }, [currentTopology, compromisedNodeIds, targetNodeIds, isolatedNodeIds]);

  const handleSelectPreset = (preset: NetworkTopology) => {
    setCurrentTopology(preset);
    // Set smart defaults for compromised/target nodes
    if (preset.nodes.length >= 2) {
      setCompromisedNodeIds([preset.nodes[0].id]);
      setTargetNodeIds([preset.nodes[preset.nodes.length - 1].id]);
    } else {
      setCompromisedNodeIds([]);
      setTargetNodeIds([]);
    }
    setIsolatedNodeIds([]);
    setSelectedNode(null);
    setSelectedPath(null);
    setAnalysisToast(null);
  };

  const handleToggleCompromised = (nodeId: string) => {
    setCompromisedNodeIds((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const handleToggleTarget = (nodeId: string) => {
    setTargetNodeIds((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const handleToggleIsolated = (nodeId: string) => {
    setIsolatedNodeIds((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const handleResetSimulation = () => {
    setCompromisedNodeIds([]);
    setTargetNodeIds([]);
    setIsolatedNodeIds([]);
    setSelectedPath(null);
    setSelectedNode(null);
    setAnalysisToast({
      message: 'Simulation state reset. Mark nodes or click Analyze Risk to evaluate paths.',
      type: 'info',
    });
  };

  const handleRunSimulation = () => {
    setIsAnalyzingRisk(true);

    let effectiveCompromised = [...compromisedNodeIds];
    let effectiveTarget = [...targetNodeIds];

    // Smart default fallback if user has cleared or not selected nodes
    if (effectiveCompromised.length === 0 && currentTopology.nodes.length > 0) {
      effectiveCompromised = [currentTopology.nodes[0].id];
      setCompromisedNodeIds(effectiveCompromised);
    }

    if (effectiveTarget.length === 0 && currentTopology.nodes.length > 0) {
      effectiveTarget = [currentTopology.nodes[currentTopology.nodes.length - 1].id];
      setTargetNodeIds(effectiveTarget);
    }

    // Force immediate recalculation of attack paths
    const computedPaths = analyzeAndRankAttackPaths(
      currentTopology,
      effectiveCompromised,
      effectiveTarget,
      isolatedNodeIds
    );

    setTimeout(() => {
      setIsAnalyzingRisk(false);
      if (computedPaths.length > 0) {
        setSelectedPath(computedPaths[0]);
        setAnalysisToast({
          message: `⚡ Risk Analysis Complete: Evaluated ${currentTopology.nodes.length} nodes & ${currentTopology.edges.length} edges. Found ${computedPaths.length} attack path(s). Top Path Risk Score: ${computedPaths[0].mlPathRiskScore}% (${computedPaths[0].severity}).`,
          type: 'success',
        });
      } else {
        setSelectedPath(null);
        if (isolatedNodeIds.length > 0) {
          setAnalysisToast({
            message: `🛡️ Risk Analysis Complete: 0 reachable attack paths found. Active quarantine isolation is successfully blocking lateral movement.`,
            type: 'info',
          });
        } else {
          setAnalysisToast({
            message: `⚠️ Risk Analysis Complete: No valid path connects selected entry points to target crown jewels.`,
            type: 'warning',
          });
        }
      }
      setActiveTab('graph');
    }, 400);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#05070a] text-slate-300 font-sans overflow-hidden select-none">
      {/* Top Navbar Header */}
      <Navbar
        currentTopology={currentTopology}
        onSelectPreset={handleSelectPreset}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        compromisedCount={compromisedNodeIds.length}
        targetCount={targetNodeIds.length}
        pathCount={rankedPaths.length}
        onRunSimulation={handleRunSimulation}
        onResetSimulation={handleResetSimulation}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onOpenAuditor={() => setIsAuditorOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Live Analysis Pulsing Banner Overlay */}
        {isAnalyzingRisk && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-cyan-950/95 border border-cyan-400 text-cyan-200 px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md font-mono text-xs flex items-center gap-3 animate-pulse">
            <Zap className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>Running AI Risk Simulation & ML Path Scoring Engine...</span>
          </div>
        )}

        {/* Live Toast Feedback Notification Banner */}
        {analysisToast && !isAnalyzingRisk && (
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 max-w-2xl px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md font-mono text-xs flex items-center gap-3 border transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
              analysisToast.type === 'success'
                ? 'bg-slate-950/95 border-emerald-500/80 text-emerald-300 shadow-emerald-950/60'
                : analysisToast.type === 'warning'
                ? 'bg-slate-950/95 border-amber-500/80 text-amber-300 shadow-amber-950/60'
                : 'bg-slate-950/95 border-cyan-500/80 text-cyan-300 shadow-cyan-950/60'
            }`}
          >
            {analysisToast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {analysisToast.type === 'warning' && <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />}
            {analysisToast.type === 'info' && <Zap className="w-4 h-4 text-cyan-400 shrink-0" />}
            <span className="flex-1">{analysisToast.message}</span>
            <button
              onClick={() => setAnalysisToast(null)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {activeTab === 'graph' && (
          <GraphCanvas
            topology={currentTopology}
            compromisedNodeIds={compromisedNodeIds}
            targetNodeIds={targetNodeIds}
            isolatedNodeIds={isolatedNodeIds}
            selectedPath={selectedPath}
            onToggleCompromised={handleToggleCompromised}
            onToggleTarget={handleToggleTarget}
            onToggleIsolated={handleToggleIsolated}
            onNodeSelect={setSelectedNode}
            selectedNode={selectedNode}
            rankedPaths={rankedPaths}
            onSelectPath={setSelectedPath}
            onRunSimulation={handleRunSimulation}
          />
        )}

        {activeTab === 'algorithms' && (
          <AlgorithmsPanel
            topology={currentTopology}
            compromisedNodeIds={compromisedNodeIds}
            targetNodeIds={targetNodeIds}
          />
        )}

        {activeTab === 'ml' && <MLModelPanel topology={currentTopology} />}

        {activeTab === 'remediation' && (
          <RemediationPanel
            topology={currentTopology}
            rankedPaths={rankedPaths}
            selectedPath={selectedPath}
            onSelectPath={setSelectedPath}
            isolatedNodeIds={isolatedNodeIds}
            onToggleIsolated={handleToggleIsolated}
          />
        )}

        {activeTab === 'copilot' && (
          <CopilotPanel
            topology={currentTopology}
            compromisedNodeIds={compromisedNodeIds}
            targetNodeIds={targetNodeIds}
          />
        )}

        {activeTab === 'attack-labs' && (
          <AttackLabsPanel
            topology={currentTopology}
            onApplyIsolationToGraph={(isolatedIds) => setIsolatedNodeIds(isolatedIds)}
          />
        )}
      </main>

      {/* Futuristic Telemetry Footer (Immersive UI theme) */}
      <footer className="h-8 bg-[#020408] border-t border-cyan-900/30 px-4 flex items-center justify-between font-mono text-[10px] text-slate-500 shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            GRAPH_ENGINE: ACTIVE
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-cyan-400">
            ML_MODEL: RANDOM_FOREST_V2 (AUC 0.885)
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="hidden md:inline">
            PRESET: {currentTopology.name.toUpperCase()}
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-slate-300">
            HOMEGUARD SECURITY AI OPS
          </span>
        </div>
      </footer>

      {/* Import / Export & Topology Editor Modal */}
      {isImportExportOpen && (
        <ImportExportModal
          topology={currentTopology}
          onUpdateTopology={(newTop) => {
            setCurrentTopology(newTop);
            if (newTop.nodes.length >= 2) {
              setCompromisedNodeIds([newTop.nodes[0].id]);
              setTargetNodeIds([newTop.nodes[newTop.nodes.length - 1].id]);
            }
          }}
          onClose={() => setIsImportExportOpen(false)}
        />
      )}

      {/* Security Guardrail Verification Suite Modal */}
      <SecurityAuditorModal
        isOpen={isAuditorOpen}
        onClose={() => setIsAuditorOpen(false)}
      />
    </div>
  );
};

export default App;
