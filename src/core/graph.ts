import type { GraphState, GraphNode, GraphEdge } from '../types/graph.types';
import { CITY_NODES, buildRawEdges } from '../data/cityGraph';

function euclidean(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

export function buildGraphState(): GraphState {
  const nodes = new Map<string, GraphNode>();
  for (const n of CITY_NODES) nodes.set(n.id, n);

  const allEdges = buildRawEdges();
  const adjacency = new Map<string, GraphEdge[]>();
  for (const n of CITY_NODES) adjacency.set(n.id, []);
  for (const e of allEdges) {
    adjacency.get(e.from)!.push(e);
  }

  // Compute weightPerPixel for A* heuristic
  let totalRatio = 0;
  let count = 0;
  for (const e of allEdges) {
    const from = nodes.get(e.from)!;
    const to = nodes.get(e.to)!;
    const px = euclidean(from.x, from.y, to.x, to.y);
    if (px > 0) {
      totalRatio += e.baseWeight / px;
      count++;
    }
  }
  const weightPerPixel = count > 0 ? totalRatio / count : 0.03;

  return { nodes, adjacency, weightPerPixel };
}

export function applyTrafficUpdate(
  state: GraphState,
  updatedEdges: GraphEdge[]
): GraphState {
  // Build a lookup by edge id for O(1) update
  const updateMap = new Map<string, GraphEdge>();
  for (const e of updatedEdges) updateMap.set(e.id, e);

  const adjacency = new Map<string, GraphEdge[]>();
  for (const [nodeId, edges] of state.adjacency) {
    adjacency.set(
      nodeId,
      edges.map((e) => updateMap.get(e.id) ?? e)
    );
  }

  return { ...state, adjacency };
}

/** Flat list of all edges (one direction each) for traffic simulation */
export function getAllEdges(state: GraphState): GraphEdge[] {
  const seen = new Set<string>();
  const result: GraphEdge[] = [];
  for (const edges of state.adjacency.values()) {
    for (const e of edges) {
      if (!seen.has(e.id)) {
        seen.add(e.id);
        result.push(e);
      }
    }
  }
  return result;
}
