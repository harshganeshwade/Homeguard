/**
 * HomeGuard - AI Cyber Attack Graph & Risk Prediction System
 * Core Data Models & TypeScript Interfaces
 */

export type AssetType =
  | 'Firewall'
  | 'WebServer'
  | 'AppServer'
  | 'Database'
  | 'EmployeePC'
  | 'AdminServer'
  | 'DomainController'
  | 'CloudServer'
  | 'OT_Gateway'
  | 'APIGateway';

export interface Vulnerability {
  cveId: string;
  name: string;
  cvssScore: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  exploitAvailable: boolean;
  affectedProtocol?: string;
  affectedPort?: number;
}

export interface NetworkNode {
  id: string;
  name: string;
  type: AssetType;
  ip: string;
  subnet: string;
  os: string;
  criticality: number; // 1 (lowest) to 5 (highest / crown jewel)
  knownVulnerabilities: Vulnerability[];
  openPorts: number[];
  x?: number; // visual coordinate
  y?: number; // visual coordinate
  // Runtime attributes
  isCompromised?: boolean;
  isTarget?: boolean;
  compromiseTime?: number;
  mlRiskScore?: number; // 0.0 to 1.0 (predicted by Random Forest)
  betweennessCentrality?: number;
}

export interface NetworkEdge {
  id: string;
  source: string; // source node id
  target: string; // target node id
  protocol: 'SSH' | 'SQL' | 'HTTP' | 'HTTPS' | 'RDP' | 'SMB' | 'DNS' | 'FTP' | 'KubeAPI' | 'AWS_IAM';
  port: number;
  authRequired: boolean;
  cvssScore: number; // 0.0 to 10.0
  exploitability: number; // 0.0 to 1.0
  riskWeight: number; // Computed structural risk cost (higher = lower risk or cost formula)
  description: string;
  timestamp: string;
  // Runtime calculated ML risk
  mlEdgeRiskScore?: number; // 0.0 to 1.0
}

export interface NetworkTopology {
  id: string;
  name: string;
  description: string;
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface AttackState {
  compromisedNodeIds: string[];
  targetNodeIds: string[];
  selectedPathId?: string;
  maxPathDepth: number;
  riskThreshold: number; // 0 to 100%
  simulationStep: number;
}

export interface PathHop {
  hopNumber: number;
  fromNode: NetworkNode;
  toNode: NetworkNode;
  viaEdge: NetworkEdge;
  hopRiskScore: number;
}

export interface AttackPath {
  pathId: string;
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  hops: PathHop[];
  totalRiskWeight: number;
  mlPathRiskScore: number; // percentage 0-100%
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  bottleneckNode: NetworkNode;
  mitigations: string[];
}

export interface GraphAlgorithmResults {
  bfsReachability: {
    startNodeId: string;
    reachableNodeIds: string[];
    depthMap: Record<string, number>;
  };
  dfsPathsCount: number;
  dijkstraPath: {
    path: string[];
    cost: number;
    edges: NetworkEdge[];
  } | null;
  aStarPath: {
    path: string[];
    cost: number;
    edges: NetworkEdge[];
  } | null;
  betweennessCentrality: Record<string, number>;
  connectedComponents: string[][];
  cycles: string[][];
}

export interface FeatureVector {
  nodeId: string;
  inDegree: number;
  outDegree: number;
  totalDegree: number;
  maxCvss: number;
  avgCvss: number;
  vulnerabilityCount: number;
  authRequiredRatio: number;
  criticality: number;
  highRiskPortCount: number;
  centralityScore: number;
  isCompromisedLabel?: number; // 0 or 1 for training
}

export interface FeatureImportance {
  featureName: string;
  importance: number; // 0.0 to 1.0
  description: string;
}

export interface MLModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  treesCount: number;
  trainingSamplesCount: number;
  featureImportances: FeatureImportance[];
}

export interface RemediationItem {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  targetAsset: string;
  action: string;
  impactScore: number; // % risk reduction
  category: 'Network Segmentation' | 'Patching' | 'MFA & Auth' | 'Access Control' | 'Monitoring';
}

export interface AISecurityBrief {
  summary: string;
  attackVectorAnalysis: string;
  criticalChokepoints: string[];
  recommendedPlaybook: {
    immediate: string[];
    shortTerm: string[];
    strategic: string[];
  };
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

// ==========================================
// Section 11/12: Attack Labs Data Models
// ==========================================

export type SimulationMode = 'manual-step' | 'auto-tick';
export type SimulationStatus = 'idle' | 'running' | 'contained' | 'target-reached' | 'stopped';
export type AnalystActionType = 'isolate' | 'patch' | 'restrict_edge';

export interface AnalystAction {
  id: string;
  actionType: AnalystActionType;
  targetId: string; // nodeId or edgeId
  targetName: string;
  tickApplied: number;
  analystId: string;
  timestamp: string;
  token: string;
  hash: string;
  previousHash: string;
}

export interface BlockedAttempt {
  edgeId: string;
  sourceNodeId: string;
  sourceNodeName: string;
  targetNodeId: string;
  targetNodeName: string;
  reason: 'Isolated Node' | 'Edge Restricted' | 'Patched Defense' | 'Stochastic Shield Roll';
  rollValue: number;
  threshold: number;
}

export interface TickSnapshot {
  tick: number;
  timestamp: string;
  compromisedNodeIds: string[];
  newlyCompromisedThisTick: string[];
  isolatedNodeIds: string[];
  patchedNodeIds: string[];
  restrictedEdgeIds: string[];
  blockedAttempts: BlockedAttempt[];
  analystActions: AnalystAction[];
  frontierNodeIds: string[];
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CRITICAL';
  entryNodeIds: string[];
  targetNodeIds: string[];
  aggressiveness: number; // 0.1 to 1.0
}

export interface SimulationRun {
  runId: string;
  scenarioId: string;
  scenarioName: string;
  entryNodeIds: string[];
  targetNodeIds: string[];
  aggressiveness: number; // 0.1 to 1.0
  mode: SimulationMode;
  status: SimulationStatus;
  currentTick: number;
  maxTicks: number;
  startedAt: string;
  endedAt?: string;
  snapshots: TickSnapshot[];
  analystActions: AnalystAction[];
  randomSeed: number;
}

export interface AfterActionReport {
  runId: string;
  containmentScore: number; // 0.0 - 1.0
  speedBonus: number; // 0.0 - 1.0
  targetPenalty: number; // 0.0 or 0.5
  finalScorePercentage: number; // 0 - 100%
  grade: 'S' | 'A' | 'B' | 'C' | 'F';
  nodesCompromisedCount: number;
  totalNodesCount: number;
  timeToContainmentTicks: number;
  targetReached: boolean;
  criticalIntervention?: AnalystAction;
  aiDebrief: AISecurityBrief;
}

