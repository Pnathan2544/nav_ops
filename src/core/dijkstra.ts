import type { GraphState, GraphEdge, PathResult } from '../types/graph.types';

// ── Min-Heap ───────────────────────────────────────────────────────────────

interface HeapItem {
  id: string;
  cost: number;
}

class MinHeap {
  private data: HeapItem[] = [];

  get size() { return this.data.length; }

  push(item: HeapItem) {
    this.data.push(item);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): HeapItem | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  private bubbleUp(i: number) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.data[parent].cost <= this.data[i].cost) break;
      [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
      i = parent;
    }
  }

  private sinkDown(i: number) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this.data[l].cost < this.data[smallest].cost) smallest = l;
      if (r < n && this.data[r].cost < this.data[smallest].cost) smallest = r;
      if (smallest === i) break;
      [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
      i = smallest;
    }
  }
}

// ── Dijkstra ──────────────────────────────────────────────────────────────

export function dijkstra(
  state: GraphState,
  startId: string,
  endId: string
): PathResult | null {
  const dist = new Map<string, number>();
  const prev = new Map<string, { nodeId: string; edge: GraphEdge } | null>();
  const visited = new Set<string>();
  let nodesExplored = 0;

  for (const id of state.nodes.keys()) {
    dist.set(id, Infinity);
    prev.set(id, null);
  }
  dist.set(startId, 0);

  const heap = new MinHeap();
  heap.push({ id: startId, cost: 0 });

  while (heap.size > 0) {
    const { id: u } = heap.pop()!;
    if (visited.has(u)) continue;
    visited.add(u);
    nodesExplored++;

    if (u === endId) break;

    for (const edge of state.adjacency.get(u) ?? []) {
      const v = edge.to;
      if (visited.has(v)) continue;
      const newCost = dist.get(u)! + edge.currentWeight;
      if (newCost < dist.get(v)!) {
        dist.set(v, newCost);
        prev.set(v, { nodeId: u, edge });
        heap.push({ id: v, cost: newCost });
      }
    }
  }

  if (dist.get(endId) === Infinity) return null;

  return reconstructPath(startId, endId, prev, nodesExplored);
}

// ── Path reconstruction (shared) ──────────────────────────────────────────

export function reconstructPath(
  startId: string,
  endId: string,
  prev: Map<string, { nodeId: string; edge: GraphEdge } | null>,
  nodesExplored: number
): PathResult {
  const path: string[] = [];
  const edges: GraphEdge[] = [];

  let cur = endId;
  while (cur !== startId) {
    path.unshift(cur);
    const entry = prev.get(cur)!;
    edges.unshift(entry.edge);
    cur = entry.nodeId;
  }
  path.unshift(startId);

  const totalDistance = edges.reduce((s, e) => s + e.baseWeight, 0);
  const totalTime = edges.reduce((s, e) => s + e.currentWeight, 0);

  return {
    path,
    edges,
    totalDistance: Math.round(totalDistance * 10) / 10,
    totalTime: Math.round(totalTime),
    hops: path.length - 2,
    nodesExplored,
  };
}
