import type { GraphState, GraphEdge, PathResult } from '../types/graph.types';
import { reconstructPath } from './dijkstra';

interface HeapItem {
  id: string;
  f: number; // g + h
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
      if (this.data[parent].f <= this.data[i].f) break;
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
      if (l < n && this.data[l].f < this.data[smallest].f) smallest = l;
      if (r < n && this.data[r].f < this.data[smallest].f) smallest = r;
      if (smallest === i) break;
      [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
      i = smallest;
    }
  }
}

function euclidean(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

export function astar(
  state: GraphState,
  startId: string,
  endId: string
): PathResult | null {
  const endNode = state.nodes.get(endId)!;
  const h = (id: string): number => {
    const n = state.nodes.get(id)!;
    return euclidean(n.x, n.y, endNode.x, endNode.y) * state.weightPerPixel;
  };

  const g = new Map<string, number>();
  const prev = new Map<string, { nodeId: string; edge: GraphEdge } | null>();
  const visited = new Set<string>();
  let nodesExplored = 0;

  for (const id of state.nodes.keys()) {
    g.set(id, Infinity);
    prev.set(id, null);
  }
  g.set(startId, 0);

  const heap = new MinHeap();
  heap.push({ id: startId, f: h(startId) });

  while (heap.size > 0) {
    const { id: u } = heap.pop()!;
    if (visited.has(u)) continue;
    visited.add(u);
    nodesExplored++;

    if (u === endId) break;

    for (const edge of state.adjacency.get(u) ?? []) {
      const v = edge.to;
      if (visited.has(v)) continue;
      const newG = g.get(u)! + edge.currentWeight;
      if (newG < g.get(v)!) {
        g.set(v, newG);
        prev.set(v, { nodeId: u, edge });
        heap.push({ id: v, f: newG + h(v) });
      }
    }
  }

  if (g.get(endId) === Infinity) return null;

  return reconstructPath(startId, endId, prev, nodesExplored);
}
