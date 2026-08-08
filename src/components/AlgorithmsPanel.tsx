/**
 * HomeGuard - Graph Algorithms Panel (F4 - F10)
 * Interactive runner and inspector for BFS, DFS, Dijkstra, A*, Betweenness Centrality, Connected Components, Cycle Detection
 */

import React, { useState } from 'react';
import { NetworkTopology, NetworkNode } from '../types';
import {
  computeBFSReachability,
  computeDFSPaths,
  computeDijkstraPath,
  computeAStarPath,
  computeBetweennessCentrality,
  computeConnectedComponents,
  computeCycles,
} from '../utils/graphAlgorithms';
import {
  Cpu,
  Compass,
  GitBranch,
  CornerDownRight,
  BarChart3,
  Globe,
  RotateCw,
  Play,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AlgorithmsPanelProps {
  topology: NetworkTopology;
  compromisedNodeIds: string[];
  targetNodeIds: string[];
}

export const AlgorithmsPanel: React.FC<AlgorithmsPanelProps> = ({
  topology,
  compromisedNodeIds,
  targetNodeIds,
}) => {
  const [sourceId, setSourceId] = useState<string>(
    compromisedNodeIds[0] || topology.nodes[0]?.id || ''
  );
  const [targetId, setTargetId] = useState<string>(
    targetNodeIds[0] || topology.nodes[topology.nodes.length - 1]?.id || ''
  );

  const [activeAlgorithm, setActiveAlgorithm] = useState<
    'bfs' | 'dfs' | 'dijkstra' | 'astar' | 'centrality' | 'components' | 'cycles'
  >('dijkstra');

  // Compute live results
  const bfsResult = computeBFSReachability(topology, sourceId);
  const dfsResult = computeDFSPaths(topology, sourceId, targetId, 6, 20);
  const dijkstraResult = computeDijkstraPath(topology, sourceId, targetId);
  const astarResult = computeAStarPath(topology, sourceId, targetId);
  const centralityResult = computeBetweennessCentrality(topology);
  const componentsResult = computeConnectedComponents(topology);
  const cyclesResult = computeCycles(topology);

  const nodeMap = new Map<string, NetworkNode>(topology.nodes.map((n) => [n.id, n]));

  return (
    <div className="flex-1 p-4 md:p-6 bg-[#05070a] text-slate-300 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0f18] p-5 rounded-2xl border border-cyan-900/30 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                F4 - F10 Suite
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                Network Graph Algorithms Engine
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic structural graph analysis calculating reachability, path optimization, centrality, and topological anomalies.
            </p>
          </div>

          {/* Node Selector Controls */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Source:</span>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="bg-slate-900 text-cyan-300 border border-slate-700 rounded px-2 py-1 outline-none focus:border-cyan-500"
              >
                {topology.nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name} ({node.ip})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Target:</span>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="bg-slate-900 text-amber-300 border border-slate-700 rounded px-2 py-1 outline-none focus:border-amber-500"
              >
                {topology.nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name} ({node.ip})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Algorithm Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveAlgorithm('dijkstra')}
            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 text-center ${
              activeAlgorithm === 'dijkstra'
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950'
                : 'bg-[#0a0f18] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="font-bold">Dijkstra (F6)</span>
            <span className="text-[10px] text-slate-500">Lowest Risk Cost</span>
          </button>

          <button
            onClick={() => setActiveAlgorithm('astar')}
            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 text-center ${
              activeAlgorithm === 'astar'
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950'
                : 'bg-[#0a0f18] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <GitBranch className="w-4 h-4 text-blue-400" />
            <span className="font-bold">A* Path (F7)</span>
            <span className="text-[10px] text-slate-500">Heuristic Search</span>
          </button>

          <button
            onClick={() => setActiveAlgorithm('bfs')}
            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 text-center ${
              activeAlgorithm === 'bfs'
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950'
                : 'bg-[#0a0f18] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">BFS Blast (F4)</span>
            <span className="text-[10px] text-slate-500">Reachability Set</span>
          </button>

          <button
            onClick={() => setActiveAlgorithm('dfs')}
            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 text-center ${
              activeAlgorithm === 'dfs'
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950'
                : 'bg-[#0a0f18] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CornerDownRight className="w-4 h-4 text-amber-400" />
            <span className="font-bold">DFS Enum (F5)</span>
            <span className="text-[10px] text-slate-500">Path Enumeration</span>
          </button>

          <button
            onClick={() => setActiveAlgorithm('centrality')}
            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 text-center ${
              activeAlgorithm === 'centrality'
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950'
                : 'bg-[#0a0f18] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span className="font-bold">Centrality (F8)</span>
            <span className="text-[10px] text-slate-500">Betweenness Rank</span>
          </button>

          <button
            onClick={() => setActiveAlgorithm('components')}
            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 text-center ${
              activeAlgorithm === 'components'
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950'
                : 'bg-[#0a0f18] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <GitBranch className="w-4 h-4 text-rose-400" />
            <span className="font-bold">Components (F9)</span>
            <span className="text-[10px] text-slate-500">Isolated Segments</span>
          </button>

          <button
            onClick={() => setActiveAlgorithm('cycles')}
            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 text-center ${
              activeAlgorithm === 'cycles'
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950'
                : 'bg-[#0a0f18] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <RotateCw className="w-4 h-4 text-red-400" />
            <span className="font-bold">Cycles (F10)</span>
            <span className="text-[10px] text-slate-500">Anomalous Loops</span>
          </button>
        </div>

        {/* Algorithm Output Content Display */}
        <div className="bg-[#0a0f18] rounded-2xl border border-cyan-900/30 p-6 shadow-2xl">
          {activeAlgorithm === 'dijkstra' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-cyan-400" />
                    F6: Dijkstra Lowest-Cost / Shortest Path
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Calculates the minimum risk-cost path between source and target using edge risk weights.
                  </p>
                </div>
                {dijkstraResult && (
                  <span className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-xs rounded-full">
                    Path Weight Cost: {dijkstraResult.cost}
                  </span>
                )}
              </div>

              {dijkstraResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500">Optimal Path:</span>
                    {dijkstraResult.path.map((id, idx) => {
                      const node = nodeMap.get(id);
                      return (
                        <React.Fragment key={id}>
                          <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-semibold">
                            {node?.name || id} ({node?.ip})
                          </span>
                          {idx < dijkstraResult.path.length - 1 && (
                            <span className="text-red-400">→</span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                      Hop-by-Hop Edge Traversal
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dijkstraResult.edges.map((edge, i) => (
                        <div
                          key={edge.id}
                          className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs font-mono space-y-1"
                        >
                          <div className="flex justify-between font-bold text-slate-200">
                            <span>Hop {i + 1}: {edge.source} → {edge.target}</span>
                            <span className="text-red-400">CVSS {edge.cvssScore}</span>
                          </div>
                          <div className="text-slate-400 text-[11px]">{edge.description}</div>
                          <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                            <span>Protocol: {edge.protocol}:{edge.port}</span>
                            <span>Auth: {edge.authRequired ? 'Enforced' : 'None'}</span>
                            <span>Weight: {edge.riskWeight}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-950 rounded-xl text-center text-xs text-slate-500 italic">
                  No path exists between source asset and target asset.
                </div>
              )}
            </div>
          )}

          {activeAlgorithm === 'astar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-blue-400" />
                    F7: A* Heuristic Shortest Path Algorithm
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Accelerates path search for large topologies (&gt;500 nodes) using topological heuristic guidance.
                  </p>
                </div>
                {astarResult && (
                  <span className="px-3 py-1 bg-blue-950 text-blue-300 border border-blue-800 font-mono text-xs rounded-full">
                    A* Calculated Cost: {astarResult.cost}
                  </span>
                )}
              </div>

              {astarResult ? (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-blue-300 flex items-center gap-2 flex-wrap">
                  <span className="text-slate-500">Heuristic Path:</span>
                  {astarResult.path.map((id, idx) => {
                    const node = nodeMap.get(id);
                    return (
                      <React.Fragment key={id}>
                        <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-semibold">
                          {node?.name || id}
                        </span>
                        {idx < astarResult.path.length - 1 && (
                          <span className="text-blue-400">→</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 bg-slate-950 rounded-xl text-center text-xs text-slate-500 italic">
                  No reachable path identified by A* algorithm.
                </div>
              )}
            </div>
          )}

          {activeAlgorithm === 'bfs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-400" />
                    F4: BFS Reachability Blast Radius
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Computes all reachable assets from the starting compromised node across hop levels.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-xs rounded-full">
                  Reachable Assets: {bfsResult.reachableNodeIds.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {bfsResult.reachableNodeIds.map((nodeId) => {
                  const node = nodeMap.get(nodeId);
                  const depth = bfsResult.depthMap[nodeId];
                  return (
                    <div
                      key={nodeId}
                      className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs font-mono space-y-1"
                    >
                      <div className="flex justify-between font-bold text-slate-200">
                        <span>{node?.name || nodeId}</span>
                        <span className="text-emerald-400">Hop Depth {depth}</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">{node?.ip} ({node?.type})</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeAlgorithm === 'dfs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CornerDownRight className="w-5 h-5 text-amber-400" />
                    F5: DFS Path Enumeration
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enumerates distinct traversal paths from source to target asset.
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-950 text-amber-300 border border-amber-800 font-mono text-xs rounded-full">
                  Distinct Paths: {dfsResult.length}
                </span>
              </div>

              <div className="space-y-2">
                {dfsResult.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs flex items-center justify-between gap-2"
                  >
                    <span className="text-amber-400 font-bold">Path #{idx + 1}:</span>
                    <span className="text-slate-300 truncate">
                      {p.nodes.map((n) => n.name).join(' → ')}
                    </span>
                    <span className="text-slate-500 text-[10px] whitespace-nowrap">
                      {p.edges.length} Hops
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeAlgorithm === 'centrality' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  F8: Betweenness Centrality Ranking
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ranks assets by how frequently they lie on shortest paths across all node pairs in the graph. High centrality assets represent structural chokepoints.
                </p>
              </div>

              <div className="space-y-2">
                {Object.entries(centralityResult)
                  .sort((a, b) => b[1] - a[1])
                  .map(([nodeId, score]) => {
                    const node = nodeMap.get(nodeId);
                    return (
                      <div
                        key={nodeId}
                        className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl font-mono text-xs flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                          <div>
                            <div className="font-bold text-slate-200">{node?.name || nodeId}</div>
                            <div className="text-[10px] text-slate-500">{node?.ip} ({node?.type})</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="bg-purple-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, score * 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-purple-300 w-12 text-right">
                            {score}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {activeAlgorithm === 'components' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-rose-400" />
                  F9: Connected Components Analysis
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Identifies isolated network subgraphs and network perimeter boundaries.
                </p>
              </div>

              <div className="space-y-3">
                {componentsResult.map((comp, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="text-xs font-mono font-bold text-rose-400 flex justify-between">
                      <span>Network Segment Component #{idx + 1}</span>
                      <span>{comp.length} Assets</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {comp.map((id) => {
                        const node = nodeMap.get(id);
                        return (
                          <span
                            key={id}
                            className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono rounded"
                          >
                            {node?.name || id}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeAlgorithm === 'cycles' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <RotateCw className="w-5 h-5 text-red-400" />
                  F10: Topological Cycle Detection
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Flags circular communication dependencies or traffic loops in network topology.
                </p>
              </div>

              {cyclesResult.length > 0 ? (
                <div className="space-y-2">
                  {cyclesResult.map((cycle, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl font-mono text-xs text-red-300 flex items-center gap-2 flex-wrap"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="font-bold text-white">Cycle #{idx + 1}:</span>
                      {cycle.map((id, i) => {
                        const node = nodeMap.get(id);
                        return (
                          <React.Fragment key={i}>
                            <span>{node?.name || id}</span>
                            {i < cycle.length - 1 && <span>↻</span>}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-slate-950 rounded-xl text-center text-xs text-slate-500 italic flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No circular communication loops detected in this topology. Network graph is a Directed Acyclic Graph (DAG).</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
