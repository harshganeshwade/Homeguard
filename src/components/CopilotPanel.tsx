/**
 * HomeGuard - AI Threat Copilot Assistant (Gemini 3.6 Flash)
 * Interactive Security Chat Assistant for threat hunting & natural language queries
 */

import React, { useState } from 'react';
import { NetworkTopology } from '../types';
import { Bot, Send, User, Sparkles, RefreshCw, ShieldAlert, Zap } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  verification?: {
    totalCited: number;
    verifiedNodeIds: string[];
    invalidCitations: string[];
    status: string;
  };
}

interface CopilotPanelProps {
  topology: NetworkTopology;
  compromisedNodeIds: string[];
  targetNodeIds: string[];
}

export const CopilotPanel: React.FC<CopilotPanelProps> = ({
  topology,
  compromisedNodeIds,
  targetNodeIds,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I am HomeGuard AI Threat Copilot powered by Gemini 3.6 Flash.\n\nI have indexed topology "${topology.name}" with ${topology.nodes.length} assets and ${topology.edges.length} connections.\n\nYou can ask me questions such as:\n- "What is the most vulnerable asset in this topology?"\n- "How would an attacker move from DMZ to Active Directory?"\n- "Explain betweenness centrality scores for our servers."`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/threat-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: query,
          topologySummary: {
            name: topology.name,
            nodeCount: topology.nodes.length,
            edgeCount: topology.edges.length,
            validNodeIds: topology.nodes.map((n) => n.id),
          },
          attackState: {
            compromisedNodeIds,
            targetNodeIds,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to query Copilot.');
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.text || 'No response returned.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        verification: data.verification,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Copilot Query Error:', err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: `Error communicating with Gemini Copilot: ${err.message || 'Server error'}. Please ensure GEMINI_API_KEY is configured in Settings > Secrets.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'Which asset is the bottleneck for lateral movement?',
    'What firewall or segmentation rules should we add immediately?',
    'Explain how Random Forest predicts risk for our database.',
  ];

  return (
    <div className="flex-1 p-4 md:p-6 bg-[#05070a] text-slate-300 flex flex-col h-full overflow-hidden">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col bg-[#0a0f18] rounded-2xl border border-purple-900/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-purple-900/30 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                HomeGuard AI Threat Copilot
                <span className="px-2 py-0.5 text-[9px] font-mono bg-purple-950 text-purple-300 border border-purple-800 rounded-full">
                  Gemini 3.6 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-400">RAG-Grounded Natural Language Threat Copilot</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 bg-slate-900 text-purple-300 border border-slate-800 rounded-lg">
              API Quota: 10/10 Queries
            </span>
          </div>
        </div>

        {/* Safety & Grounding Disclaimer Banner */}
        <div className="px-5 py-2 bg-purple-950/30 border-b border-purple-900/30 flex items-center gap-2 text-[11px] font-mono text-purple-300/90">
          <ShieldAlert className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>
            <strong>AI-Assisted Guidance:</strong> RAG-grounded on current graph state. Human approval required before applying remediation actions. Models will not authoritatively state a network is 100% safe.
          </span>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto font-mono text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-950 border border-cyan-800 text-cyan-100 rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 border-b border-slate-800 pb-1 gap-2">
                  <span>{msg.sender === 'user' ? 'Security Analyst' : 'Threat Copilot AI'}</span>
                  <div className="flex items-center gap-2">
                    {msg.verification && (
                      <div className="flex items-center gap-1.5 font-mono text-[9px]">
                        {msg.verification.totalCited > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                            ✓ {msg.verification.verifiedNodeIds.length}/{msg.verification.totalCited} Grounded Nodes
                          </span>
                        )}
                        {msg.verification.invalidCitations && msg.verification.invalidCitations.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                            ⚠️ Unverified Citations Flagged: {msg.verification.invalidCitations.map(c => `[${c}]`).join(' ')}
                          </span>
                        )}
                      </div>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
                <div>{msg.text}</div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-cyan-400" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-purple-400 font-mono">
              <Bot className="w-5 h-5 text-purple-400 animate-bounce" />
              <span>Copilot is analyzing graph topology and invoking Gemini model...</span>
            </div>
          )}
        </div>

        {/* Sample Prompt Chips */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[10px] font-mono text-slate-500 uppercase whitespace-nowrap">
            Prompts:
          </span>
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-lg whitespace-nowrap text-[11px] font-mono transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Query Input Box */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a question about network risk, attack paths, or mitigations..."
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 outline-none focus:border-purple-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputQuery.trim()}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-purple-950"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
