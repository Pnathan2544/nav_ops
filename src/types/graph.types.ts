export type NodeType = 'intersection' | 'highway' | 'district';
export type CongestionLevel = 'low' | 'moderate' | 'high' | 'gridlock';
export type AlgorithmType = 'dijkstra' | 'astar';

export interface GraphNode {
  id: string;
  label: string;
  x: number;   // SVG viewport coordinate (0–1000)
  y: number;   // SVG viewport coordinate (0–700)
  type: NodeType;
  zone: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  baseWeight: number;        // Base distance/time cost
  trafficMultiplier: number; // 1.0 = clear, up to 4.2 = gridlock
  currentWeight: number;     // baseWeight * trafficMultiplier
  congestionLevel: CongestionLevel;
  phase: number;             // Internal: 0–2π for smooth traffic evolution
  isHighway: boolean;
}

export interface PathResult {
  path: string[];            // Ordered node IDs
  edges: GraphEdge[];        // Edges traversed in order
  totalDistance: number;     // Sum of baseWeights (km)
  totalTime: number;         // Estimated minutes (based on currentWeight)
  hops: number;
  nodesExplored: number;     // For algorithm comparison display
}

export interface GraphState {
  nodes: Map<string, GraphNode>;
  adjacency: Map<string, GraphEdge[]>; // nodeId → outgoing edges
  weightPerPixel: number;              // Scale factor for A* heuristic
}
