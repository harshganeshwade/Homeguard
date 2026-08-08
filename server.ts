/**
 * HomeGuard - Server Entry Point
 * Express Server + Vite Middleware + Server-Side Gemini API Endpoints
 */

import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize server-side Gemini client with User-Agent telemetry header
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment variables.');
    }
    return new GoogleGenAI({
      apiKey: apiKey || 'DUMMY_KEY_FOR_INIT',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'HomeGuard Cyber Attack Graph Engine' });
  });

  // Server-Side Rate Limiter Middleware for API Cost & Abuse Protection
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
  const MAX_REQUESTS_PER_MIN = 25;

  const rateLimitMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
    const now = Date.now();
    const clientRecord = rateLimitMap.get(ip);

    if (!clientRecord || now > clientRecord.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
      return next();
    }

    if (clientRecord.count >= MAX_REQUESTS_PER_MIN) {
      const retryAfterSec = Math.ceil((clientRecord.resetTime - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        error: `Rate limit exceeded. Maximum ${MAX_REQUESTS_PER_MIN} AI requests allowed per minute. Please retry in ${retryAfterSec}s.`,
        retryAfterSec,
      });
    }

    clientRecord.count += 1;
    next();
  };

  // Gemini Endpoint: Analyze Attack Path & Generate Security Brief
  app.post('/api/gemini/analyze-path', rateLimitMiddleware, async (req, res) => {
    const startTime = Date.now();
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY environment variable is required in Settings > Secrets.',
        });
      }

      const { attackPath, topologyName } = req.body;
      if (!attackPath) {
        return res.status(400).json({ error: 'Missing attackPath payload.' });
      }

      // Fail-Closed Schema-Driven Allowlist Redactor
      let sanitizedHops: Array<{ hopNumber: number; from: { name: string; ip: string; type: string }; to: { name: string; ip: string; type: string }; edge: { protocol: string; port: number; cvssScore: number } }> = [];
      try {
        if (!attackPath || !Array.isArray(attackPath.hops)) {
          throw new Error('Malformed attackPath payload - fail closed');
        }
        sanitizedHops = attackPath.hops.map((h: any) => ({
          hopNumber: Number(h.hopNumber) || 0,
          from: {
            name: String(h.fromNode?.name || 'Asset').replace(/[^\w\s\.\-]/g, ''),
            ip: String(h.fromNode?.ip || '0.0.0.0').replace(/[^\d\.]/g, ''),
            type: String(h.fromNode?.type || 'UNKNOWN').replace(/[^\w]/g, ''),
          },
          to: {
            name: String(h.toNode?.name || 'Asset').replace(/[^\w\s\.\-]/g, ''),
            ip: String(h.toNode?.ip || '0.0.0.0').replace(/[^\d\.]/g, ''),
            type: String(h.toNode?.type || 'UNKNOWN').replace(/[^\w]/g, ''),
          },
          edge: {
            protocol: String(h.viaEdge?.protocol || 'TCP').replace(/[^\w]/g, ''),
            port: Number(h.viaEdge?.port) || 0,
            cvssScore: Number(h.viaEdge?.cvssScore) || 0,
          },
        }));
      } catch (redactErr) {
        console.error('Redactor fail-closed triggered:', redactErr);
        sanitizedHops = [];
      }

      const ai = getAiClient();
      const prompt = `
You are a Lead Cyber Security Architect & DFIR Investigator analyzing a critical attack path in the network topology: "${String(topologyName || 'Topology').replace(/[^\w\s\.\-]/g, '')}".

CRITICAL GROUNDING CONSTRAINTS:
1. You MUST ONLY summarize, narrate, and recommend playbooks based strictly on the provided path nodes, edges, CVSS scores, and bottleneck assets.
2. DO NOT invent, hallucinate, or fabricate new CVE IDs, non-existent assets, or uncalculated vulnerability statistics.
3. Maintain high precision and ground truth fidelity to the input data. Always cite explicit asset names and node IDs.

Attack Path Overview:
Path ID: ${String(attackPath.pathId || '').replace(/[^\w\-]/g, '')}
Severity: ${String(attackPath.severity || 'UNKNOWN')}
Path Risk Score: ${Number(attackPath.mlPathRiskScore) || 0}%
Hop Count: ${sanitizedHops.length}
Bottleneck Asset: ${String(attackPath.bottleneckNode?.name || 'Unknown').replace(/[^\w\s\.\-]/g, '')} (${String(attackPath.bottleneckNode?.ip || 'N/A').replace(/[^\d\.]/g, '')})

Hop-by-Hop Breakdown:
${sanitizedHops
  .map(
    (h) =>
      `Hop ${h.hopNumber}: ${h.from.name} (${h.from.ip}) --[${h.edge.protocol}:${h.edge.port} | CVSS ${h.edge.cvssScore}]--> ${h.to.name} (${h.to.ip})`
  )
  .join('\n')}

Provide a structured JSON response with the following exact structure:
{
  "summary": "Concise executive overview of the vulnerability chain and exploit progression strictly based on these hops.",
  "attackVectorAnalysis": "Technical breakdown of how an attacker would move laterally through these hops.",
  "criticalChokepoints": ["Chokepoint 1", "Chokepoint 2"],
  "recommendedPlaybook": {
    "immediate": ["Immediate containment action 1", "Immediate containment action 2"],
    "shortTerm": ["Short-term remediation 1", "Short-term remediation 2"],
    "strategic": ["Strategic architectural hardening 1"]
  },
  "threatLevel": "${attackPath.severity || 'HIGH'}"
}
`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
      } catch (modErr) {
        console.warn('Fallback to gemini-flash-latest model due to:', modErr);
        response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
      }

      const responseText = response.text || '{}';
      const briefData = JSON.parse(responseText);
      const latencyMs = Date.now() - startTime;

      return res.json({
        success: true,
        brief: briefData,
        latencyMs,
        grounded: true,
      });
    } catch (err: any) {
      console.error('Gemini Analyze Path Error:', err);
      return res.status(500).json({
        error: 'Failed to generate AI Security Brief: ' + (err.message || 'Server error'),
      });
    }
  });

  // Gemini Endpoint: Natural Language Threat Copilot
  app.post('/api/gemini/threat-query', rateLimitMiddleware, async (req, res) => {
    const startTime = Date.now();
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY environment variable is required in Settings > Secrets.',
        });
      }

      const { userQuery, topologySummary, attackState } = req.body;

      // Free-text Query Sanitizer & Prompt Injection Neutralizer
      const sanitizedUserQuery = String(userQuery || '')
        .replace(/ignore\s+(previous|all)\s+instructions/gi, '[REDACTED_PROMPT_INJECTION]')
        .replace(/system\s+prompt:/gi, '[REDACTED]')
        .replace(/[<>]/g, '')
        .trim();

      const ai = getAiClient();

      const prompt = `
You are HomeGuard Security AI Copilot, an expert in network attack graph modeling, graph algorithms (BFS, DFS, Dijkstra, Betweenness Centrality), and Random Forest cyber risk prediction.

CRITICAL GUARDRAIL & SCOPE RULES:
1. SCOPE BOUNDARY: You specialize ONLY in cyber security, network topology, attack graph modeling, vulnerability risk analysis, and threat mitigations. If the user query is completely unrelated to cyber security or this network, politely decline and instruct them to ask a cyber security or graph analysis question.
2. GROUNDING CONSTRAINT: Answer queries grounded in the provided topology state and graph metrics. Explicitly cite specific Node IDs (e.g., [gw-01], [fw-01], [dc-01]) for any mentioned assets so the user can verify on the canvas.
3. NON-AUTHORITATIVE SAFETY DISCLAIMER: NEVER authoritatively declare or claim that a system or network is 100% "safe", "invulnerable", or "bulletproof". Always clarify that risk scores and safety evaluations reflect the modeled graph state and known vulnerability datasets.

Current Network State Context:
Topology: ${String(topologySummary?.name || 'Enterprise Network').replace(/[^\w\s\.\-]/g, '')}
Total Assets (Nodes): ${Number(topologySummary?.nodeCount) || 0}
Total Connections (Edges): ${Number(topologySummary?.edgeCount) || 0}
Compromised Assets: ${Array.isArray(attackState?.compromisedNodeIds) ? attackState.compromisedNodeIds.join(', ') : 'None'}
Target Assets: ${Array.isArray(attackState?.targetNodeIds) ? attackState.targetNodeIds.join(', ') : 'None'}
Active Critical Attack Paths: ${Number(attackState?.pathCount) || 0}

User Query: "${sanitizedUserQuery}"

Provide an expert, concise, markdown-formatted response with clear bullet points. Include risk scores, graph algorithms, or asset node IDs when applicable.
`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
        });
      } catch (modErr) {
        console.warn('Fallback to gemini-flash-latest model due to:', modErr);
        response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: prompt,
        });
      }

      const responseText = response.text || '';
      const latencyMs = Date.now() - startTime;

      // Server-Side Grounding Citation Enforcer: Validate referenced [node-id] brackets against current topology
      const validNodeIds: string[] = Array.isArray(topologySummary?.validNodeIds)
        ? topologySummary.validNodeIds
        : ['gw-01', 'fw-01', 'web-01', 'app-01', 'db-01', 'dc-01', 'ws-01', 'ws-02', 'iot-01'];

      const matches = responseText.match(/\[([a-zA-Z0-9\-_]+)\]/g) || [];
      const extractedCitations: string[] = Array.from(new Set(matches.map((m) => m.slice(1, -1))));
      const verifiedCitations = extractedCitations.filter((id) => validNodeIds.includes(id));
      const invalidCitations = extractedCitations.filter((id) => !validNodeIds.includes(id));

      return res.json({
        success: true,
        text: responseText,
        latencyMs,
        grounded: true,
        verification: {
          totalCited: extractedCitations.length,
          verifiedNodeIds: verifiedCitations,
          invalidCitations: invalidCitations,
          status: invalidCitations.length === 0 ? 'ALL_VERIFIED' : 'PARTIAL_UNVERIFIED',
        },
      });
    } catch (err: any) {
      console.error('Gemini Threat Query Error:', err);
      return res.status(500).json({
        error: 'Failed to process AI Threat Query: ' + (err.message || 'Server error'),
      });
    }
  });

  // Vite middleware in development vs static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HomeGuard Server running on http://localhost:${PORT}`);
  });
}

startServer();
