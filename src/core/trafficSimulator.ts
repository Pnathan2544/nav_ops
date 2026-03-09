import type { GraphEdge, CongestionLevel } from '../types/graph.types';

const MULTIPLIERS: Record<CongestionLevel, number> = {
  low:      1.0,
  moderate: 1.8,
  high:     2.8,
  gridlock: 4.2,
};

function congestionFromSin(value: number): CongestionLevel {
  // value in [-1, 1] → map to [0, 1]
  const normalized = (value + 1) / 2;
  if (normalized < 0.45) return 'low';
  if (normalized < 0.65) return 'moderate';
  if (normalized < 0.85) return 'high';
  return 'gridlock';
}

export function simulateTrafficStep(edges: GraphEdge[]): GraphEdge[] {
  return edges.map((edge) => {
    // Phase advances faster for highway edges (more volatile)
    const delta = edge.isHighway
      ? 0.15 + Math.random() * 0.2
      : 0.05 + Math.random() * 0.1;

    const phase = (edge.phase + delta) % (Math.PI * 2);
    const congestionLevel = congestionFromSin(Math.sin(phase));
    const trafficMultiplier = MULTIPLIERS[congestionLevel];

    return {
      ...edge,
      phase,
      congestionLevel,
      trafficMultiplier,
      currentWeight: Math.round(edge.baseWeight * trafficMultiplier * 10) / 10,
    };
  });
}

export function congestionColor(level: CongestionLevel): string {
  switch (level) {
    case 'low':      return '#22c55e'; // green-500
    case 'moderate': return '#eab308'; // yellow-500
    case 'high':     return '#f97316'; // orange-500
    case 'gridlock': return '#ef4444'; // red-500
  }
}

export function congestionLabel(level: CongestionLevel): string {
  switch (level) {
    case 'low':      return 'Clear';
    case 'moderate': return 'Moderate';
    case 'high':     return 'Heavy';
    case 'gridlock': return 'Gridlock';
  }
}
