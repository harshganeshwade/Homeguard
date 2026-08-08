/**
 * HomeGuard - Graph Canvas Component
 * Interactive Cytoscape / Network Graph Visualization
 * Supports node/edge selection, compromised/target marking, attack path highlighting
 */

import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';
import {
  NetworkTopology,
  NetworkNode,
  NetworkEdge,
  AttackPath,
  AssetType,
} from '../types';
import {
  ShieldAlert,
  Target,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Layers,
  Lock,
  Terminal,
  Activity,
  Zap,
} from 'lucide-react';

interface GraphCanvasProps {
  topology: NetworkTopology;
  compromisedNodeIds: string[];
  targetNodeIds: string[];
  isolatedNodeIds?: string[];
  selectedPath: AttackPath | null;
  onToggleCompromised: (nodeId: string) => void;
  onToggleTarget: (nodeId: string) => void;
  onToggleIsolated?: (nodeId: string) => void;
  onNodeSelect: (node: NetworkNode | null) => void;
  selectedNode: NetworkNode | null;
  rankedPaths: AttackPath[];
  onSelectPath: (path: AttackPath) => void;
  onRunSimulation?: () => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  topology,
  compromisedNodeIds,
  targetNodeIds,
  isolatedNodeIds = [],
  selectedPath,
  onToggleCompromised,
  onToggleTarget,
  onToggleIsolated,
  onNodeSelect,
  selectedNode,
  rankedPaths,
  onSelectPath,
  onRunSimulation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const nodePositionsRef = useRef<Record<string, { x: number; y: number }>>({});

  // Active Layout state: 'cose' (fluid spring physics) | 'preset' | 'concentric' | 'breadthfirst' | 'circle'
  const [activeLayout, setActiveLayout] = useState<'cose' | 'preset' | 'concentric' | 'breadthfirst' | 'circle'>('cose');

  // Track topology ID to reset cached positions on topology switch
  const lastTopologyNameRef = useRef<string>(topology.name);
  if (lastTopologyNameRef.current !== topology.name) {
    nodePositionsRef.current = {};
    lastTopologyNameRef.current = topology.name;
  }

  // Helper colors for asset types
  const getAssetColor = (type: AssetType) => {
    switch (type) {
      case 'Firewall':
        return '#f97316'; // orange
      case 'WebServer':
        return '#06b6d4'; // cyan
      case 'AppServer':
        return '#3b82f6'; // blue
      case 'Database':
        return '#8b5cf6'; // purple
      case 'EmployeePC':
        return '#64748b'; // slate
      case 'AdminServer':
        return '#ec4899'; // pink
      case 'DomainController':
        return '#eab308'; // yellow / crown jewel
      case 'CloudServer':
        return '#10b981'; // emerald
      case 'OT_Gateway':
        return '#f43f5e'; // rose
      case 'APIGateway':
        return '#0284c7';
      default:
        return '#64748b';
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Convert topology to Cytoscape elements
    const elements: cytoscape.ElementDefinition[] = [];

    topology.nodes.forEach((node) => {
      const isCompromised = compromisedNodeIds.includes(node.id);
      const isTarget = targetNodeIds.includes(node.id);
      const isIsolated = isolatedNodeIds.includes(node.id);
      const isPathMember =
        selectedPath?.nodes.some((n) => n.id === node.id) ?? false;

      let borderCol = getAssetColor(node.type);
      if (isCompromised) borderCol = '#ef4444'; // Red
      if (isTarget) borderCol = '#f59e0b'; // Amber
      if (isIsolated) borderCol = '#eab308'; // Yellow Quarantine
      if (isPathMember) borderCol = '#06b6d4'; // Cyan glow

      // Retrieve cached dragged position if present, else fallback to node.x/y
      const cachedPos = nodePositionsRef.current[node.id];
      const initialPos = cachedPos
        ? cachedPos
        : node.x !== undefined && node.y !== undefined
        ? { x: node.x, y: node.y }
        : undefined;

      elements.push({
        data: {
          id: node.id,
          label: isIsolated ? `${node.name}\n[ISOLATED]` : `${node.name}\n(${node.ip})`,
          type: node.type,
          criticality: node.criticality,
          isCompromised,
          isTarget,
          isIsolated,
          isPathMember,
          assetColor: getAssetColor(node.type),
        },
        position: initialPos,
      });
    });

    topology.edges.forEach((edge) => {
      const isPathEdge =
        selectedPath?.edges.some((e) => e.id === edge.id) ?? false;

      elements.push({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: `${edge.protocol}:${edge.port}`,
          cvss: edge.cvssScore,
          authRequired: edge.authRequired,
          isPathEdge,
        },
      });
    });

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      wheelSensitivity: 0.2,
      userPanningEnabled: true,
      userZoomingEnabled: true,
      boxSelectionEnabled: false,
      autoungrabify: false,
      autolock: false,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            color: '#cbd5e1',
            'font-size': '10px',
            'font-family': 'monospace',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'background-color': '#0f172a',
            'border-width': 3,
            'border-color': 'data(assetColor)',
            width: 44,
            height: 44,
            'text-wrap': 'wrap',
            'text-max-width': '120px',
            'transition-property':
              'background-color, border-color, border-width, shadow-blur',
            'transition-duration': 0.2,
          },
        },
        {
          selector: 'node[?isCompromised]',
          style: {
            'background-color': '#7f1d1d',
            'border-color': '#ef4444',
            'border-width': 5,
            width: 50,
            height: 50,
            color: '#fca5a5',
          },
        },
        {
          selector: 'node[?isTarget]',
          style: {
            'background-color': '#78350f',
            'border-color': '#f59e0b',
            'border-width': 5,
            width: 50,
            height: 50,
            color: '#fde68a',
          },
        },
        {
          selector: 'node[?isIsolated]',
          style: {
            'background-color': '#451a03',
            'border-color': '#eab308',
            'border-width': 5,
            'border-style': 'dashed',
            width: 46,
            height: 46,
            color: '#fef08a',
          },
        },
        {
          selector: 'node[?isPathMember]',
          style: {
            'border-color': '#22d3ee',
            'border-width': 5,
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#334155',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(label)',
            'font-size': '8px',
            'font-family': 'monospace',
            color: '#64748b',
            'text-background-opacity': 0.85,
            'text-background-color': '#020617',
            'text-background-padding': '2px',
          },
        },
        {
          selector: 'edge[?isPathEdge]',
          style: {
            width: 4,
            'line-color': '#ef4444',
            'target-arrow-color': '#ef4444',
            'line-style': 'dashed',
            color: '#f87171',
            'text-background-color': '#450a0a',
          },
        },
      ],
      layout:
        activeLayout === 'cose'
          ? {
              name: 'cose',
              animate: false,
              componentSpacing: 80,
              nodeRepulsion: () => 8000,
              idealEdgeLength: () => 120,
              edgeElasticity: () => 100,
              nestingFactor: 1.2,
              gravity: 0.25,
              padding: 40,
            }
          : {
              name: activeLayout,
              fit: true,
              padding: 50,
            },
    });

    // Capture dragged node positions so they persist naturally across updates
    cy.on('dragfree position', 'node', (evt) => {
      const node = evt.target;
      nodePositionsRef.current[node.id()] = node.position();
    });

    cy.on('tap', 'node', (evt) => {
      const nodeId = evt.target.id();
      const node = topology.nodes.find((n) => n.id === nodeId);
      if (node) {
        onNodeSelect(node);
      }
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        onNodeSelect(null);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [topology, compromisedNodeIds, targetNodeIds, selectedPath, isolatedNodeIds, activeLayout]);

  // Smoothly center/focus graph on selected attack path nodes
  useEffect(() => {
    if (cyRef.current && selectedPath && selectedPath.nodes.length > 0) {
      const pathNodeIds = selectedPath.nodes.map((n) => n.id);
      const elementsToFit = cyRef.current.nodes().filter((n) => pathNodeIds.includes(n.id()));
      if (elementsToFit.length > 0) {
        cyRef.current.animate({
          fit: {
            eles: elementsToFit,
            padding: 90,
          },
          duration: 450,
        });
      }
    }
  }, [selectedPath]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit();

  const handleRerunLayout = (layoutName: 'cose' | 'preset' | 'concentric' | 'breadthfirst' | 'circle') => {
    setActiveLayout(layoutName);
    if (!cyRef.current) return;

    if (layoutName === 'preset') {
      nodePositionsRef.current = {};
    }

    const layoutConfig =
      layoutName === 'cose'
        ? {
            name: 'cose',
            animate: true,
            animationDuration: 700,
            componentSpacing: 80,
            nodeRepulsion: () => 8000,
            idealEdgeLength: () => 120,
            padding: 40,
          }
        : {
            name: layoutName,
            animate: true,
            animationDuration: 700,
            fit: true,
            padding: 50,
          };

    cyRef.current.layout(layoutConfig as any).run();
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#05070a]">
      {/* Main Canvas Area */}
      <div className="flex-1 relative flex flex-col bg-[#0a0f18] rounded-xl border border-cyan-900/30 shadow-inner overflow-hidden m-2 md:m-3">
        {/* Top Controls Overlay */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 pointer-events-auto">
          <span className="px-3 py-1 bg-black/70 border border-slate-700/80 rounded-full text-[11px] text-slate-300 font-mono tracking-tight shadow-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Assets: <strong className="text-white">{topology.nodes.length}</strong>
          </span>
          <span className="px-3 py-1 bg-black/70 border border-slate-700/80 rounded-full text-[11px] text-slate-300 font-mono tracking-tight shadow-md flex items-center gap-1.5">
            Connections: <strong className="text-cyan-400">{topology.edges.length}</strong>
          </span>
          <span className="px-3 py-1 bg-red-950/80 border border-red-800/80 rounded-full text-[11px] text-red-300 font-mono tracking-tight shadow-md flex items-center gap-1.5">
            Compromised: <strong className="text-red-400">{compromisedNodeIds.length}</strong>
          </span>
          <span className="px-3 py-1 bg-amber-950/80 border border-amber-800/80 rounded-full text-[11px] text-amber-300 font-mono tracking-tight shadow-md flex items-center gap-1.5">
            Targets: <strong className="text-amber-400">{targetNodeIds.length}</strong>
          </span>
        </div>

        {/* Canvas Tools & Layout Mode Bar */}
        <div className="absolute top-4 right-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Layout Mode Selector Bar */}
          <div className="flex items-center gap-1 bg-black/85 border border-cyan-900/50 rounded-xl p-1 shadow-xl text-xs font-mono">
            <span className="px-2 py-0.5 text-[10px] text-slate-400 font-semibold flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>Layout:</span>
            </span>

            <button
              onClick={() => handleRerunLayout('cose')}
              title="CoSE Spring Physics Layout — Freely Floating Nodes"
              className={`px-2 py-1 rounded-lg text-[11px] transition-all flex items-center gap-1 ${
                activeLayout === 'cose'
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>CoSE Spring</span>
            </button>

            <button
              onClick={() => handleRerunLayout('preset')}
              title="Preset Custom Grid Coordinates"
              className={`px-2 py-1 rounded-lg text-[11px] transition-all ${
                activeLayout === 'preset'
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <span>Preset Grid</span>
            </button>

            <button
              onClick={() => handleRerunLayout('concentric')}
              title="Concentric Circles Layout"
              className={`px-2 py-1 rounded-lg text-[11px] transition-all ${
                activeLayout === 'concentric'
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <span>Concentric</span>
            </button>

            <button
              onClick={() => handleRerunLayout('breadthfirst')}
              title="Hierarchical Tree Layout"
              className={`px-2 py-1 rounded-lg text-[11px] transition-all ${
                activeLayout === 'breadthfirst'
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <span>Tree</span>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-black/85 border border-slate-800 rounded-xl p-1 shadow-xl">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleFit}
              title="Fit Canvas"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cytoscape Container */}
        <div
          ref={containerRef}
          className="flex-1 w-full h-full bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#05070a_100%)] relative cursor-grab active:cursor-grabbing"
          style={{ minHeight: '480px' }}
        />

        {/* Canvas Legend */}
        <div className="p-3 bg-black/60 border-t border-cyan-900/30 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 border border-red-300 shadow-sm shadow-red-500"></span>
              Compromised Entry
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-300 shadow-sm shadow-amber-500"></span>
              High-Value Target
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-cyan-400 bg-slate-900"></span>
              Active Attack Path
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 border-b-2 border-dashed border-red-500"></span>
              Exploit Path Hop
            </span>
          </div>

          <div className="text-cyan-400/90 text-xs flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Click any node to inspect vulnerabilities & toggle simulation state</span>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Selected Asset Details & Ranked Attack Paths Panel */}
      <div className="w-full md:w-80 flex flex-col gap-3 p-2 md:p-3 bg-[#05070a] border-t md:border-t-0 md:border-l border-slate-800/80 overflow-y-auto">
        {/* Node Inspector Card */}
        {selectedNode ? (
          <div className="bg-[#0a0f18] rounded-xl border border-cyan-900/40 p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-start justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-semibold">
                  {selectedNode.type}
                </span>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                  {selectedNode.name}
                </h3>
                <p className="text-xs font-mono text-slate-400">{selectedNode.ip}</p>
              </div>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono rounded border border-slate-700">
                Crit: {selectedNode.criticality}/5
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">OS / Platform:</span>
                <span className="truncate max-w-[140px] text-right">{selectedNode.os}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Subnet:</span>
                <span>{selectedNode.subnet}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Open Ports:</span>
                <span className="text-cyan-400">{selectedNode.openPorts.join(', ')}</span>
              </div>
            </div>

            {/* Known Vulnerabilities */}
            <div className="border-t border-slate-800 pt-2">
              <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Vulnerabilities ({selectedNode.knownVulnerabilities?.length || 0})
              </h4>
              {selectedNode.knownVulnerabilities?.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {selectedNode.knownVulnerabilities.map((v) => (
                    <div
                      key={v.cveId}
                      className="p-2 bg-slate-900/90 border border-slate-800 rounded text-[11px]"
                    >
                      <div className="flex justify-between font-bold">
                        <span className="text-red-400">{v.cveId}</span>
                        <span
                          className={`px-1 rounded text-[9px] ${
                            v.cvssScore >= 9.0
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          CVSS {v.cvssScore}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1 text-[10px] line-clamp-2">
                        {v.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No unpatched CVEs found.</p>
              )}
            </div>

            {/* Simulation Action Buttons */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onToggleCompromised(selectedNode.id)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    compromisedNodeIds.includes(selectedNode.id)
                      ? 'bg-red-600 text-white shadow-md shadow-red-900/50'
                      : 'bg-red-950/40 text-red-300 border border-red-800/60 hover:bg-red-900/40'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>
                    {compromisedNodeIds.includes(selectedNode.id)
                      ? 'Unmark Compromised'
                      : 'Set Compromised'}
                  </span>
                </button>

                <button
                  onClick={() => onToggleTarget(selectedNode.id)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    targetNodeIds.includes(selectedNode.id)
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-900/50'
                      : 'bg-amber-950/40 text-amber-300 border border-amber-800/60 hover:bg-amber-900/40'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>
                    {targetNodeIds.includes(selectedNode.id)
                      ? 'Unmark Target'
                      : 'Set Target'}
                  </span>
                </button>
              </div>

              {onToggleIsolated && (
                <button
                  onClick={() => onToggleIsolated(selectedNode.id)}
                  className={`w-full px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isolatedNodeIds.includes(selectedNode.id)
                      ? 'bg-yellow-600 text-slate-950 font-bold shadow-md shadow-yellow-900/50'
                      : 'bg-yellow-950/40 text-yellow-300 border border-yellow-800/60 hover:bg-yellow-900/40'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {isolatedNodeIds.includes(selectedNode.id)
                      ? 'Release Quarantine Isolation'
                      : 'Quarantine / Isolate Asset'}
                  </span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#0a0f18] rounded-xl border border-slate-800 p-4 text-center text-xs text-slate-400">
            <Info className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No Asset Selected</p>
            <p className="mt-1 text-slate-500">
              Click any node in the graph canvas to inspect hardware, vulnerabilities, and set compromise state.
            </p>
          </div>
        )}

        {/* Ranked Attack Paths Preview */}
        <div className="flex-1 bg-[#0a0f18] rounded-xl border border-red-900/30 flex flex-col overflow-hidden">
          <div className="px-3 py-2.5 bg-red-950/20 border-b border-red-900/30 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Ranked Attack Paths
            </h3>
            <span className="px-1.5 py-0.5 bg-red-500/20 text-red-300 text-[10px] font-mono rounded">
              {rankedPaths.length} Threats
            </span>
          </div>

          <div className="p-2 space-y-2 overflow-y-auto max-h-72">
            {rankedPaths.length > 0 ? (
              rankedPaths.map((path) => {
                const isSelected = selectedPath?.pathId === path.pathId;
                return (
                  <div
                    key={path.pathId}
                    onClick={() => onSelectPath(path)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-lg shadow-cyan-950'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 text-[11px] font-mono">
                      <span className="font-bold text-red-400">{path.pathId}</span>
                      <span
                        className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                          path.severity === 'CRITICAL'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {path.mlPathRiskScore}% RISK ({path.severity})
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-400 truncate mb-1.5">
                      {path.nodes.map((n) => n.name).join(' → ')}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{path.hops.length} Hops</span>
                      <span>Pivot: {path.bottleneckNode.name}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 space-y-3">
                <p>
                  Mark nodes as <strong className="text-red-400">Compromised</strong> and <strong className="text-amber-400">Target</strong>, or click below to run AI Risk Analysis with smart defaults.
                </p>
                {onRunSimulation && (
                  <button
                    onClick={onRunSimulation}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-lg text-xs shadow-md flex items-center justify-center gap-1.5 mx-auto transition-all transform active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Run AI Risk Analysis Now</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
