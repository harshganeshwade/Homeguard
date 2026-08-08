/**
 * HomeGuard - Import / Export & Graph Topology Editor Modal (F1 & F3)
 * Allows users to export active topology to JSON, import custom JSON configs, or manually add/edit nodes and edges.
 */

import React, { useState } from 'react';
import { NetworkTopology, NetworkNode, NetworkEdge, AssetType } from '../types';
import { X, Download, Upload, Plus, Trash2, Code, Shield } from 'lucide-react';

interface ImportExportModalProps {
  topology: NetworkTopology;
  onUpdateTopology: (newTopology: NetworkTopology) => void;
  onClose: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  topology,
  onUpdateTopology,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'json' | 'addNode' | 'addEdge'>('json');
  const [jsonText, setJsonText] = useState(() => JSON.stringify(topology, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  // New Node Form State
  const [nodeName, setNodeName] = useState('');
  const [nodeIp, setNodeIp] = useState('192.168.1.100');
  const [nodeType, setNodeType] = useState<AssetType>('WebServer');
  const [nodeCriticality, setNodeCriticality] = useState<number>(3);
  const [nodePorts, setNodePorts] = useState('80, 443');

  // New Edge Form State
  const [edgeSource, setEdgeSource] = useState(topology.nodes[0]?.id || '');
  const [edgeTarget, setEdgeTarget] = useState(topology.nodes[1]?.id || '');
  const [edgeProtocol, setEdgeProtocol] = useState('TCP');
  const [edgePort, setEdgePort] = useState(80);
  const [edgeCvss, setEdgeCvss] = useState(7.5);
  const [edgeAuth, setEdgeAuth] = useState(false);

  const handleImportJson = () => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(jsonText);
      if (!parsed.nodes || !parsed.edges) {
        throw new Error('Topology JSON must contain "nodes" and "edges" arrays.');
      }
      onUpdateTopology(parsed);
      onClose();
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON topology structure.');
    }
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonText);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${topology.id || 'topology'}_config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeName.trim() || !nodeIp.trim()) return;

    const newNode: NetworkNode = {
      id: `node-${Date.now()}`,
      name: nodeName,
      ip: nodeIp,
      type: nodeType,
      criticality: nodeCriticality,
      subnet: '192.168.1.0/24',
      os: 'Linux Enterprise',
      openPorts: nodePorts.split(',').map((p) => parseInt(p.trim())).filter(Boolean),
      knownVulnerabilities: [
        {
          cveId: 'CVE-2024-SYS-CUSTOM',
          name: 'Custom Asset Unpatched Flaw',
          cvssScore: 7.5,
          severity: 'HIGH',
          exploitAvailable: true,
          description: 'Custom added asset unpatched vulnerability.',
        },
      ],
      x: 300 + Math.random() * 200,
      y: 300 + Math.random() * 200,
    };

    onUpdateTopology({
      ...topology,
      nodes: [...topology.nodes, newNode],
    });

    setNodeName('');
    setActiveTab('json');
    setJsonText(JSON.stringify({ ...topology, nodes: [...topology.nodes, newNode] }, null, 2));
  };

  const handleAddEdge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edgeSource || !edgeTarget || edgeSource === edgeTarget) return;

    const newEdge: NetworkEdge = {
      id: `edge-${Date.now()}`,
      source: edgeSource,
      target: edgeTarget,
      protocol: edgeProtocol,
      port: edgePort,
      cvssScore: edgeCvss,
      authRequired: edgeAuth,
      riskWeight: edgeCvss * (edgeAuth ? 0.8 : 1.2),
      exploitability: 0.8,
      timestamp: new Date().toISOString(),
      description: `Manual Connection via ${edgeProtocol}:${edgePort}`,
    };

    onUpdateTopology({
      ...topology,
      edges: [...topology.edges, newEdge],
    });

    setActiveTab('json');
    setJsonText(JSON.stringify({ ...topology, edges: [...topology.edges, newEdge] }, null, 2));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0a0f18] border border-cyan-900/40 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Code className="w-4 h-4 text-cyan-400" />
            <span>Topology Configuration Manager (F1 & F3)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-2 gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2 rounded-t-lg font-semibold transition-all ${
              activeTab === 'json'
                ? 'bg-[#0a0f18] text-cyan-400 border-t-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            JSON Spec Import/Export
          </button>
          <button
            onClick={() => setActiveTab('addNode')}
            className={`px-4 py-2 rounded-t-lg font-semibold transition-all ${
              activeTab === 'addNode'
                ? 'bg-[#0a0f18] text-cyan-400 border-t-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            + Add Asset Node
          </button>
          <button
            onClick={() => setActiveTab('addEdge')}
            className={`px-4 py-2 rounded-t-lg font-semibold transition-all ${
              activeTab === 'addEdge'
                ? 'bg-[#0a0f18] text-cyan-400 border-t-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            + Add Network Edge
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'json' && (
            <div className="space-y-4 font-mono text-xs">
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={14}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-cyan-300 font-mono text-xs outline-none focus:border-cyan-500"
              />

              {jsonError && (
                <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 rounded-lg text-xs">
                  {jsonError}
                </div>
              )}

              <div className="flex justify-between items-center">
                <button
                  onClick={handleDownloadJson}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download JSON Spec</span>
                </button>

                <button
                  onClick={handleImportJson}
                  className="flex items-center gap-1.5 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-lg shadow-cyan-950"
                >
                  <Upload className="w-4 h-4" />
                  <span>Apply & Load Topology</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'addNode' && (
            <form onSubmit={handleAddNode} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Asset Name</label>
                  <input
                    type="text"
                    value={nodeName}
                    onChange={(e) => setNodeName(e.target.value)}
                    placeholder="e.g. app-cluster-01"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">IP Address</label>
                  <input
                    type="text"
                    value={nodeIp}
                    onChange={(e) => setNodeIp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Asset Type</label>
                  <select
                    value={nodeType}
                    onChange={(e) => setNodeType(e.target.value as AssetType)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
                  >
                    <option value="WebServer">Web Server</option>
                    <option value="AppServer">App Server</option>
                    <option value="Database">Database</option>
                    <option value="DomainController">Domain Controller</option>
                    <option value="Firewall">Firewall / Gateway</option>
                    <option value="EmployeePC">Employee Workstation</option>
                    <option value="AdminServer">Admin Server</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Criticality (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={nodeCriticality}
                    onChange={(e) => setNodeCriticality(parseInt(e.target.value) || 3)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Open Ports (comma-separated)</label>
                <input
                  type="text"
                  value={nodePorts}
                  onChange={(e) => setNodePorts(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg transition-colors"
              >
                + Add Asset Node to Topology
              </button>
            </form>
          )}

          {activeTab === 'addEdge' && (
            <form onSubmit={handleAddEdge} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Source Asset</label>
                  <select
                    value={edgeSource}
                    onChange={(e) => setEdgeSource(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
                  >
                    {topology.nodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.name} ({node.ip})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Target Asset</label>
                  <select
                    value={edgeTarget}
                    onChange={(e) => setEdgeTarget(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
                  >
                    {topology.nodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.name} ({node.ip})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Protocol</label>
                  <input
                    type="text"
                    value={edgeProtocol}
                    onChange={(e) => setEdgeProtocol(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Port</label>
                  <input
                    type="number"
                    value={edgePort}
                    onChange={(e) => setEdgePort(parseInt(e.target.value) || 80)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Edge CVSS Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="10.0"
                    value={edgeCvss}
                    onChange={(e) => setEdgeCvss(parseFloat(e.target.value) || 7.0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg transition-colors"
              >
                + Add Edge Connection to Topology
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
