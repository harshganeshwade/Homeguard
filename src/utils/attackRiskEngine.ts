/**
 * HomeGuard - Attack Risk Engine
 * F15-F18: Path Risk Scoring, Severity Classification, Candidate Path Ranking & Mitigation Generator
 */

import { NetworkTopology, NetworkNode, NetworkEdge, AttackPath, PathHop, RemediationItem } from '../types';
import { computeDFSPaths, computeDijkstraPath } from './graphAlgorithms';
import { extractNodeFeatureVector, getTrainedRandomForestModel } from './randomForest';

/**
 * Calculates Path Risk Score and Severity Classification
 */
export function analyzeAndRankAttackPaths(
  topology: NetworkTopology,
  compromisedNodeIds: string[],
  targetNodeIds: string[],
  isolatedNodeIds: string[] = []
): AttackPath[] {
  if (compromisedNodeIds.length === 0 || targetNodeIds.length === 0) {
    return [];
  }

  // Filter out isolated/quarantined nodes and associated edges for path computation
  const filteredTopology: NetworkTopology = {
    ...topology,
    nodes: topology.nodes.filter((n) => !isolatedNodeIds.includes(n.id)),
    edges: topology.edges.filter(
      (e) => !isolatedNodeIds.includes(e.source) && !isolatedNodeIds.includes(e.target)
    ),
  };

  const activeCompromised = compromisedNodeIds.filter((id) => !isolatedNodeIds.includes(id));
  const activeTargets = targetNodeIds.filter((id) => !isolatedNodeIds.includes(id));

  if (activeCompromised.length === 0 || activeTargets.length === 0) {
    return [];
  }

  const mlModel = getTrainedRandomForestModel();
  const nodeMap = new Map(filteredTopology.nodes.map((n) => [n.id, n]));
  const attackPaths: AttackPath[] = [];

  // Re-score nodes with ML model
  const nodeMlScores: Record<string, number> = {};
  for (const node of filteredTopology.nodes) {
    const fv = extractNodeFeatureVector(node, filteredTopology);
    nodeMlScores[node.id] = mlModel.predictNodeCompromiseProb(fv);
  }

  let pathCounter = 1;

  for (const sourceId of activeCompromised) {
    for (const targetId of activeTargets) {
      if (sourceId === targetId) continue;

      // Find DFS paths on active non-isolated topology
      const dfsPaths = computeDFSPaths(filteredTopology, sourceId, targetId, 6, 20);

      // Also ensure Dijkstra shortest path is included
      const dijkstraResult = computeDijkstraPath(filteredTopology, sourceId, targetId);
      if (dijkstraResult && dijkstraResult.edges.length > 0) {
        const dijkstraNodes = dijkstraResult.path.map((id) => nodeMap.get(id)!).filter(Boolean);
        // Avoid duplicate
        const isDuplicate = dfsPaths.some(
          (p) => p.nodes.map((n) => n.id).join('->') === dijkstraResult.path.join('->')
        );
        if (!isDuplicate) {
          dfsPaths.push({ nodes: dijkstraNodes, edges: dijkstraResult.edges });
        }
      }

      for (const p of dfsPaths) {
        const { nodes, edges } = p;
        if (nodes.length < 2 || edges.length === 0) continue;

        const hops: PathHop[] = [];
        let cumulativeProb = 1.0;
        let totalWeight = 0;

        for (let i = 0; i < edges.length; i++) {
          const edge = edges[i];
          const fromNode = nodes[i];
          const toNode = nodes[i + 1] || nodeMap.get(edge.target)!;

          // Compute hop risk probability (combining ML target node risk, CVSS, and auth requirement)
          const toNodeMlRisk = nodeMlScores[toNode.id] || 0.5;
          const cvssRiskFactor = edge.cvssScore / 10.0;
          const authPenalty = edge.authRequired ? 0.75 : 0.95;

          const hopProb = Math.min(
            0.99,
            Math.max(0.05, (toNodeMlRisk * 0.4 + cvssRiskFactor * 0.4) * authPenalty)
          );

          cumulativeProb *= hopProb;
          totalWeight += edge.riskWeight;

          hops.push({
            hopNumber: i + 1,
            fromNode,
            toNode,
            viaEdge: edge,
            hopRiskScore: Number((hopProb * 100).toFixed(1)),
          });
        }

        // Calculate final path ML risk percentage (0 to 100%)
        // Combined path probability formula: product of hop probabilities scaled by max target criticality
        const targetNode = nodes[nodes.length - 1];
        const targetCriticalityMultiplier = targetNode ? targetNode.criticality / 5.0 : 0.8;
        
        // Geometric mean hop risk weighted by target criticality
        const geomMeanProb = Math.pow(cumulativeProb, 1 / Math.max(1, hops.length));
        const rawPathScore = (geomMeanProb * 0.7 + (cumulativeProb * 1.5)) * targetCriticalityMultiplier;
        const mlPathRiskScore = Number((Math.min(99.9, Math.max(10.0, rawPathScore * 100))).toFixed(1));

        // Assign Severity
        let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        if (mlPathRiskScore >= 80) severity = 'CRITICAL';
        else if (mlPathRiskScore >= 60) severity = 'HIGH';
        else if (mlPathRiskScore >= 35) severity = 'MEDIUM';

        // Identify bottleneck node (highest centrality or vulnerability in path)
        let bottleneckNode = nodes[1] || nodes[0];
        let maxBottleneckRisk = -1;
        for (const n of nodes) {
          const risk = (nodeMlScores[n.id] || 0) + (n.criticality / 5.0);
          if (risk > maxBottleneckRisk) {
            maxBottleneckRisk = risk;
            bottleneckNode = n;
          }
        }

        // Generate tailored mitigations
        const mitigations = generatePathMitigations(nodes, edges);

        attackPaths.push({
          pathId: `PATH-${pathCounter++}`,
          nodes,
          edges,
          hops,
          totalRiskWeight: Number(totalWeight.toFixed(2)),
          mlPathRiskScore,
          severity,
          bottleneckNode,
          mitigations,
        });
      }
    }
  }

  // F17: Rank candidate paths by severity / risk score descending
  return attackPaths.sort((a, b) => b.mlPathRiskScore - a.mlPathRiskScore);
}

/**
 * F18: Generate human-readable remediation list per path
 */
export function generatePathMitigations(nodes: NetworkNode[], edges: NetworkEdge[]): string[] {
  const mitigations: string[] = [];

  for (const edge of edges) {
    if (!edge.authRequired) {
      mitigations.push(
        `Enforce Zero-Trust MFA and Authentication on ${edge.protocol} (Port ${edge.port}) between ${edge.source} and ${edge.target}`
      );
    }
    if (edge.cvssScore >= 8.5) {
      mitigations.push(
        `Apply critical security patch for High CVSS (${edge.cvssScore}) vulnerability on ${edge.source} -> ${edge.target} (${edge.protocol})`
      );
    }
  }

  for (const node of nodes) {
    if (node.knownVulnerabilities && node.knownVulnerabilities.length > 0) {
      for (const v of node.knownVulnerabilities) {
        if (v.severity === 'CRITICAL') {
          mitigations.push(`Patch ${v.cveId} (${v.name}) on asset ${node.name} (${node.ip})`);
        }
      }
    }
  }

  // Add structural isolation advice
  if (nodes.length > 2) {
    const intermediateNode = nodes[Math.floor(nodes.length / 2)];
    mitigations.push(
      `Implement network micro-segmentation / firewall rule restricting lateral movement through ${intermediateNode.name}`
    );
  }

  // Deduplicate
  return Array.from(new Set(mitigations));
}

/**
 * Generates structured remediation panel items across the entire topology
 */
export function generateGlobalRemediationList(paths: AttackPath[]): RemediationItem[] {
  const items: RemediationItem[] = [];
  let itemCounter = 1;

  if (paths.length === 0) return items;

  const topCriticalPath = paths[0];

  for (const hop of topCriticalPath.hops) {
    if (!hop.viaEdge.authRequired) {
      items.push({
        id: `REM-${itemCounter++}`,
        title: `Enforce Authentication on Unauthenticated ${hop.viaEdge.protocol} Service`,
        severity: 'CRITICAL',
        targetAsset: `${hop.fromNode.name} -> ${hop.toNode.name}`,
        action: `Enable strict TLS/MFA credential authentication on port ${hop.viaEdge.port}. Disallow unauthenticated RPC/API requests.`,
        impactScore: 35,
        category: 'MFA & Auth',
      });
    }

    if (hop.toNode.knownVulnerabilities.length > 0) {
      const topVuln = hop.toNode.knownVulnerabilities[0];
      items.push({
        id: `REM-${itemCounter++}`,
        title: `Remediate ${topVuln.cveId} (${topVuln.severity}) on ${hop.toNode.name}`,
        severity: topVuln.severity,
        targetAsset: `${hop.toNode.name} (${hop.toNode.ip})`,
        action: `Deploy vendor patch or update software package to fix ${topVuln.name}. Block vulnerable port ${topVuln.affectedPort || hop.viaEdge.port} until patched.`,
        impactScore: 28,
        category: 'Patching',
      });
    }
  }

  items.push({
    id: `REM-${itemCounter++}`,
    title: `Micro-segment Pivot Host: ${topCriticalPath.bottleneckNode.name}`,
    severity: 'HIGH',
    targetAsset: topCriticalPath.bottleneckNode.name,
    action: `Restrict inbound network access to ${topCriticalPath.bottleneckNode.name} via ACLs to isolate the attack vector blast radius.`,
    impactScore: 22,
    category: 'Network Segmentation',
  });

  return items;
}
