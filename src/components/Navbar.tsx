/**
 * HomeGuard - Navbar Component
 */

import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Network,
  Cpu,
  CheckSquare,
  Bot,
  Upload,
  Download,
  RotateCcw,
  Zap,
  Layers,
  ChevronDown,
  Flame,
} from 'lucide-react';
import { TOPOLOGY_PRESETS } from '../data/topologyPresets';
import { NetworkTopology } from '../types';

interface NavbarProps {
  currentTopology: NetworkTopology;
  onSelectPreset: (preset: NetworkTopology) => void;
  activeTab: 'graph' | 'algorithms' | 'ml' | 'remediation' | 'copilot' | 'attack-labs';
  setActiveTab: (tab: 'graph' | 'algorithms' | 'ml' | 'remediation' | 'copilot' | 'attack-labs') => void;
  compromisedCount: number;
  targetCount: number;
  pathCount: number;
  onRunSimulation: () => void;
  onResetSimulation: () => void;
  onOpenImportExport: () => void;
  onOpenAuditor?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTopology,
  onSelectPreset,
  activeTab,
  setActiveTab,
  compromisedCount,
  targetCount,
  pathCount,
  onRunSimulation,
  onResetSimulation,
  onOpenImportExport,
  onOpenAuditor,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-blue-300 to-white bg-clip-text text-transparent">
                  HomeGuard
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60 rounded-full">
                  v1.0 ML + Graph
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI Cyber Attack Graph & Risk Prediction System
              </p>
            </div>
          </div>

          {/* Preset Selector */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Preset:</span>
            <div className="relative group">
              <button className="flex items-center gap-1.5 font-medium text-slate-200 hover:text-white transition-colors">
                <span className="max-w-[200px] truncate">{currentTopology.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <div className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50 p-1.5">
                {TOPOLOGY_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onSelectPreset(preset)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                      preset.id === currentTopology.id
                        ? 'bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800/50'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold text-slate-100">{preset.name}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats & Action Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400">Compromised:</span>
              <span className="font-bold text-red-400">{compromisedCount}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Targets:</span>
              <span className="font-bold text-amber-400">{targetCount}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Paths:</span>
              <span className="font-bold text-cyan-400">{pathCount}</span>
            </div>

            <button
              onClick={onRunSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-semibold text-xs rounded-lg shadow-md shadow-red-900/30 transition-all transform active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Analyze Risk</span>
            </button>

            <button
              onClick={onResetSimulation}
              title="Reset Attack Overlay"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenImportExport}
              title="Import / Export Topology Config"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
            >
              <Upload className="w-4 h-4" />
            </button>

            {onOpenAuditor && (
              <button
                onClick={onOpenAuditor}
                title="Run Security Guardrail Auditor Suite"
                className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 rounded-lg transition-colors border border-emerald-800/60 flex items-center gap-1 text-xs font-mono font-bold"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden xl:inline text-[11px]">Guardrail Suite</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 pt-1 border-t border-slate-800/80 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'graph'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Attack Graph Canvas</span>
          </button>

          <button
            onClick={() => setActiveTab('algorithms')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'algorithms'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Graph Algorithms (F4-F10)</span>
          </button>

          <button
            onClick={() => setActiveTab('ml')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'ml'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Random Forest ML Model</span>
          </button>

          <button
            onClick={() => setActiveTab('remediation')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'remediation'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Remediation Playbook</span>
          </button>

          <button
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'copilot'
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Threat Copilot</span>
          </button>

          <button
            onClick={() => setActiveTab('attack-labs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'attack-labs'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/40 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Attack Labs (Live Simulation & Mitigation)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
