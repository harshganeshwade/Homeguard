/**
 * HomeGuard - Graph Algorithms Engine
 * Implements F4-F10: BFS, DFS, Dijkstra, A*, Betweenness Centrality, Connected Components, Cycle Detection
 */

import { NetworkTopology, NetworkNode, NetworkEdge, GraphAlgorithmResults } from '../types';

/**
 * F4: BFS Reachability Analysis
 * Returns all reachable assets from a given starting compromised node along with hop depths.
 */
export function computeBFSReachability(
  topology: NetworkTopology,
  startNodeId: string
): GraphAlgorithmResults['bfsReachability'] {
  const visited = new Set<string>();
  const depthMap: Record<string, number> = {};
  const queue: Array<{ nodeId: string; depth: number }> = [];

  const startExists = topology.nodes.some((n) => n.id === startNodeId);
  if (!startExists) {
    return { startNodeId, reachableNodeIds: [], depthMap: {} };
  }

  queue.push({ nodeId: startNodeId, depth: 0 });
  visited.add(startNodeId);
  depthMap[startNodeId] = 0;

  while (queue.length > 0) {
    const { nodeId, depth } = queue.shift()!;

    // Find outgoing edges from nodeId
    const outgoingEdges = topology.edges.filter((e) => e.source === nodeId);
    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        visited.add(edge.target);
        depthMap[edge.target] = depth + 1;
        queue.push({ nodeId: edge.target, depth: depth + 1 });
      }
    }
  }

  const reachableNodeIds = Array.from(visited).filter((id) => id !== startNodeId);
  return { startNodeId, reachableNodeIds, depthMap };
}

/**
 * F5: DFS Path Enumeration
 * Enumerates distinct simple traversal paths from source to target.
 */
export function computeDFSPaths(
  topology: NetworkTopology,
  sourceId: string,
  targetId: string,
  maxDepth = 6,
  maxPaths = 50
): Array<{ nodes: NetworkNode[]; edges: NetworkEdge[] }> {
  const results: Array<{ nodes: NetworkNode[]; edges: NetworkEdge[] }> = [];
  const nodeMap = new Map(topology.nodes.map((n) => [n.id, n]));

  function dfs(
    currentNodeId: string,
    currentPathNodes: string[],
    currentEdges: NetworkEdge[],
    visitedNodes: Set<string>
  ) {
    if (results.length >= maxPaths) return;
    if (currentPathNodes.length > maxDepth) return;

    if (currentNodeId === targetId) {
      const fullPathNodes = currentPathNodes.map((id) => nodeMap.get(id)!).filter(Boolean);
      results.push({ nodes: fullPathNodes, edges: [...currentEdges] });
      return;
    }

    const outgoingEdges = topology.edges.filter((e) => e.source === currentNodeId);
    for (const edge of outgoingEdges) {
      const nextNodeId = edge.target;
      if (!visitedNodes.has(nextNodeId)) {
        visitedNodes.add(nextNodeId);
        currentPathNodes.push(nextNodeId);
        currentEdges.push(edge);

        dfs(nextNodeId, currentPathNodes, currentEdges, visitedNodes);

        currentEdges.pop();
        currentPathNodes.pop();
        visitedNodes.delete(nextNodeId);
      }
    }
  }

  const visited = new Set<string>([sourceId]);
  dfs(sourceId, [sourceId], [], visited);

  return results;
}

/**
 * F6: Dijkstra Lowest-Cost / Shortest Risk Path
 * Computes lowest-cost path between two nodes using edge riskWeight or computed cost.
 */
export function computeDijkstraPath(
  topology: NetworkTopology,
  sourceId: string,
  targetId: string
): { path: string[]; cost: number; edges: NetworkEdge[] } | null {
  const distances: Record<string, number> = {};
  const previous: Record<string, { nodeId: string; edge: NetworkEdge } | null> = {};
  const unvisited = new Set<string>();

  for (const node of topology.nodes) {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  }

  if (!distances.hasOwnProperty(sourceId) || !distances.hasOwnProperty(targetId)) {
    return null;
  }

  distances[sourceId] = 0;

  while (unvisited.size > 0) {
    // Pick unvisited node with smallest distance
    let currentId: string | null = null;
    let minDistance = Infinity;

    for (const id of unvisited) {
      if (distances[id] < minDistance) {
        minDistance = distances[id];
        currentId = id;
      }
    }

    if (!currentId || minDistance === Infinity) break;
    if (currentId === targetId) break;

    unvisited.delete(currentId);

    const outgoingEdges = topology.edges.filter((e) => e.source === currentId);
    for (const edge of outgoingEdges) {
      if (!unvisited.has(edge.target)) continue;

      // Cost formula: higher risk = lower cost to travel for attacker
      const edgeCost = Math.max(0.1, edge.riskWeight);
      const newDist = distances[currentId] + edgeCost;

      if (newDist < distances[edge.target]) {
        distances[edge.target] = newDist;
        previous[edge.target] = { nodeId: currentId, edge };
      }
    }
  }

  if (distances[targetId] === Infinity) return null;

  // Reconstruct path
  const path: string[] = [];
  const edges: NetworkEdge[] = [];
  let curr: string | null = targetId;

  while (curr && previous[curr]) {
    path.unshift(curr);
    edges.unshift(previous[curr]!.edge);
    curr = previous[curr]!.nodeId;
  }
  if (curr === sourceId) {
    path.unshift(sourceId);
  }

  return { path, cost: Number(distances[targetId].toFixed(2)), edges };
}

/**
 * F7: A* Heuristic Shortest Path
 * Uses Euclidean/Topological distance heuristic for faster path search on larger graphs.
 */
export function computeAStarPath(
  topology: NetworkTopology,
  sourceId: string,
  targetId: string
): { path: string[]; cost: number; edges: NetworkEdge[] } | null {
  const nodeMap = new Map(topology.nodes.map((n) => [n.id, n]));
  const targetNode = nodeMap.get(targetId);

  if (!targetNode || !nodeMap.has(sourceId)) return null;

  // Heuristic function h(nodeId)
  function heuristic(nodeId: string): number {
    const curr = nodeMap.get(nodeId);
    if (!curr || !targetNode) return 0;
    // Difference in criticality or visual layout coordinate
    if (curr.x !== undefined && curr.y !== undefined && targetNode.x !== undefined && targetNode.y !== undefined) {
      const dx = curr.x - targetNode.x;
      const dy = curr.y - targetNode.y;
      return Math.sqrt(dx * dx + dy * dy) / 500; // normalize scale
    }
    return Math.abs(curr.criticality - targetNode.criticality) * 0.2;
  }

  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};
  const previous: Record<string, { nodeId: string; edge: NetworkEdge } | null> = {};
  const openSet = new Set<string>([sourceId]);

  for (const node of topology.nodes) {
    gScore[node.id] = Infinity;
    fScore[node.id] = Infinity;
    previous[node.id] = null;
  }

  gScore[sourceId] = 0;
  fScore[sourceId] = heuristic(sourceId);

  while (openSet.size > 0) {
    // Pick node in openSet with lowest fScore
    let currentId: string | null = null;
    let minF = Infinity;

    for (const id of openSet) {
      if (fScore[id] < minF) {
        minF = fScore[id];
        currentId = id;
      }
    }

    if (!currentId) break;
    if (currentId === targetId) {
      // Reconstruct path
      const path: string[] = [];
      const edges: NetworkEdge[] = [];
      let curr: string | null = targetId;

      while (curr && previous[curr]) {
        path.unshift(curr);
        edges.unshift(previous[curr]!.edge);
        curr = previous[curr]!.nodeId;
      }
      if (curr === sourceId) path.unshift(sourceId);

      return { path, cost: Number(gScore[targetId].toFixed(2)), edges };
    }

    openSet.delete(currentId);

    const outgoingEdges = topology.edges.filter((e) => e.source === currentId);
    for (const edge of outgoingEdges) {
      const neighborId = edge.target;
      const edgeCost = Math.max(0.1, edge.riskWeight);
      const tentativeG = gScore[currentId] + edgeCost;

      if (tentativeG < gScore[neighborId]) {
        previous[neighborId] = { nodeId: currentId, edge };
        gScore[neighborId] = tentativeG;
        fScore[neighborId] = tentativeG + heuristic(neighborId);
        openSet.add(neighborId);
      }
    }
  }

  return null;
}

/**
 * F8: Betweenness Centrality
 * Ranks nodes by how often they sit on shortest paths across all node pairs in the multigraph.
 */
export function computeBetweennessCentrality(topology: NetworkTopology): Record<string, number> {
  const centralityMap: Record<string, number> = {};
  const nodes = topology.nodes;
  const n = nodes.length;

  for (const node of nodes) {
    centralityMap[node.id] = 0;
  }

  if (n <= 2) return centralityMap;

  // Brandes' Algorithm for unweighted/weighted shortest paths
  for (const sNode of nodes) {
    const s = sNode.id;
    const stack: string[] = [];
    const predecessors: Record<string, string[]> = {};
    const sigma: Record<string, number> = {}; // number of shortest paths
    const dist: Record<string, number> = {};
    const delta: Record<string, number> = {};

    for (const node of nodes) {
      predecessors[node.id] = [];
      sigma[node.id] = 0;
      dist[node.id] = Infinity;
      delta[node.id] = 0;
    }

    sigma[s] = 1;
    dist[s] = 0;

    const queue: string[] = [s];

    while (queue.length > 0) {
      const v = queue.shift()!;
      stack.push(v);

      const outgoing = topology.edges.filter((e) => e.source === v);
      for (const edge of outgoing) {
        const w = edge.target;
        // Path weight
        const edgeWeight = Math.max(0.1, edge.riskWeight);

        if (dist[w] > dist[v] + edgeWeight) {
          dist[w] = dist[v] + edgeWeight;
          queue.push(w);
          sigma[w] = sigma[v];
          predecessors[w] = [v];
        } else if (Math.abs(dist[w] - (dist[v] + edgeWeight)) < 0.001) {
          sigma[w] += sigma[v];
          predecessors[w].push(v);
        }
      }
    }

    while (stack.length > 0) {
      const w = stack.pop()!;
      for (const v of predecessors[w]) {
        delta[v] += (sigma[v] / (sigma[w] || 1)) * (1 + delta[w]);
      }
      if (w !== s) {
        centralityMap[w] += delta[w];
      }
    }
  }

  // Normalize centrality values between 0 and 1
  const scale = (n - 1) * (n - 2);
  const normFactor = scale > 0 ? 1 / scale : 1;

  for (const key in centralityMap) {
    centralityMap[key] = Number((centralityMap[key] * normFactor).toFixed(4));
  }

  return centralityMap;
}

/**
 * F9: Connected Components
 * Identifies isolated network segments (weakly connected components).
 */
export function computeConnectedComponents(topology: NetworkTopology): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];

  // Build undirected adjacency list
  const adjMap: Record<string, Set<string>> = {};
  for (const node of topology.nodes) {
    adjMap[node.id] = new Set();
  }
  for (const edge of topology.edges) {
    if (adjMap[edge.source]) adjMap[edge.source].add(edge.target);
    if (adjMap[edge.target]) adjMap[edge.target].add(edge.source);
  }

  for (const node of topology.nodes) {
    if (!visited.has(node.id)) {
      const component: string[] = [];
      const queue: string[] = [node.id];
      visited.add(node.id);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        component.push(curr);

        const neighbors = adjMap[curr] || new Set();
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }

      components.push(component);
    }
  }

  return components;
}

/**
 * F10: Cycle Detection
 * Detects topological cycles and circular traffic dependencies.
 */
export function computeCycles(topology: NetworkTopology): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const currentPath: string[] = [];

  function dfs(nodeId: string) {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    currentPath.push(nodeId);

    const outgoing = topology.edges.filter((e) => e.source === nodeId);
    for (const edge of outgoing) {
      const neighbor = edge.target;
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      } else if (recursionStack.has(neighbor)) {
        // Cycle detected!
        const cycleStartIndex = currentPath.indexOf(neighbor);
        if (cycleStartIndex !== -1) {
          const cyclePath = currentPath.slice(cycleStartIndex);
          cycles.push([...cyclePath, neighbor]);
        }
      }
    }

    currentPath.pop();
    recursionStack.delete(nodeId);
  }

  for (const node of topology.nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  }

  return cycles;
}
