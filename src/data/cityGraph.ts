import type { GraphNode, GraphEdge } from '../types/graph.types';

// 18-node fictional city map on a 1000×700 SVG viewport
// 5 zones: Downtown, Residential North, Industrial West, University, Airport South

export const CITY_NODES: GraphNode[] = [
  // Rangsit Core
  { id: 'rc1', label: 'Rangsit Station',        x: 480, y: 330, type: 'district',     zone: 'Rangsit Core' },
  { id: 'rc2', label: 'Future Park Rangsit',    x: 540, y: 390, type: 'intersection', zone: 'Rangsit Core' },
  { id: 'rc3', label: 'Zeer Rangsit',           x: 430, y: 400, type: 'district',     zone: 'Rangsit Core' },
  { id: 'rc4', label: 'Rangsit Market',         x: 510, y: 290, type: 'intersection', zone: 'Rangsit Core' },

  // Thammasat University Area
  { id: 'tu1', label: 'Thammasat University',   x: 350, y: 160, type: 'district',     zone: 'University District' },
  { id: 'tu2', label: 'Asian Institute of Tech',x: 510, y: 140, type: 'district',     zone: 'University District' },
  { id: 'tu3', label: 'Chiang Rak Station',     x: 660, y: 175, type: 'intersection', zone: 'University District' },
  { id: 'tu4', label: 'Thammasat Hospital',     x: 440, y: 220, type: 'intersection', zone: 'University District' },

  // Pathum Thani Town
  { id: 'pt1', label: 'Pathum Thani City Hall', x: 160, y: 360, type: 'district',     zone: 'Pathum Thani Town' },
  { id: 'pt2', label: 'Pathum Market',          x: 230, y: 430, type: 'intersection', zone: 'Pathum Thani Town' },
  { id: 'pt3', label: 'Chao Phraya Riverside',  x: 300, y: 310, type: 'intersection', zone: 'Pathum Thani Town' },

  // Industrial / Logistics Area
  { id: 'ind1', label: 'Navanakorn Industrial', x: 700, y: 310, type: 'district',     zone: 'Industrial' },
  { id: 'ind2', label: 'Factory Gate',          x: 780, y: 380, type: 'intersection', zone: 'Industrial' },
  { id: 'ind3', label: 'Logistics Hub',         x: 730, y: 240, type: 'intersection', zone: 'Industrial' },

  // Southern Access (Bangkok side)
  { id: 'bk1', label: 'Don Mueang Airport',     x: 560, y: 590, type: 'district',     zone: 'Bangkok North' },
  { id: 'bk2', label: 'Vibhavadi Gate',         x: 390, y: 560, type: 'intersection', zone: 'Bangkok North' },
  { id: 'bk3', label: 'Rangsit South Junction', x: 670, y: 510, type: 'intersection', zone: 'Bangkok North' },

  // Major Highway Node
  { id: 'hw1', label: 'Phahonyothin Highway',   x: 510, y: 480, type: 'highway',      zone: 'Highway' },
];

// Each road is bidirectional — we define it once here and expand in graph.ts
// baseWeight represents travel time in minutes under free-flow conditions
export interface RawEdge {
  from: string;
  to: string;
  baseWeight: number;
  isHighway?: boolean;
}

export const CITY_EDGES_RAW: RawEdge[] = [
  // Rangsit Core internal
  { from: 'rc1', to: 'rc2', baseWeight: 3 },
  { from: 'rc1', to: 'rc3', baseWeight: 3 },
  { from: 'rc1', to: 'rc4', baseWeight: 2 },
  { from: 'rc2', to: 'rc3', baseWeight: 2 },
  { from: 'rc2', to: 'hw1', baseWeight: 4 },
  { from: 'rc3', to: 'pt3', baseWeight: 7 },
  { from: 'rc4', to: 'tu4', baseWeight: 5 },
  { from: 'rc4', to: 'ind1', baseWeight: 8 },

  // University District
  { from: 'tu1', to: 'tu4', baseWeight: 5 },
  { from: 'tu1', to: 'pt3', baseWeight: 8 },
  { from: 'tu2', to: 'tu4', baseWeight: 4 },
  { from: 'tu2', to: 'tu3', baseWeight: 5 },
  { from: 'tu3', to: 'ind3', baseWeight: 6 },
  { from: 'tu4', to: 'rc1', baseWeight: 5 },

  // Pathum Thani Town
  { from: 'pt1', to: 'pt2', baseWeight: 4 },
  { from: 'pt2', to: 'pt3', baseWeight: 5 },
  { from: 'pt2', to: 'bk2', baseWeight: 9 },
  { from: 'pt3', to: 'rc3', baseWeight: 7 },

  // Industrial
  { from: 'ind1', to: 'ind2', baseWeight: 4 },
  { from: 'ind1', to: 'ind3', baseWeight: 4 },
  { from: 'ind2', to: 'bk3', baseWeight: 6 },
  { from: 'ind3', to: 'tu3', baseWeight: 6 },

  // Bangkok North / southern access
  { from: 'bk1', to: 'bk2', baseWeight: 5 },
  { from: 'bk1', to: 'bk3', baseWeight: 4 },
  { from: 'bk2', to: 'hw1', baseWeight: 6 },
  { from: 'bk3', to: 'hw1', baseWeight: 5 },

  // Main highway corridor — fast but volatile
  { from: 'hw1', to: 'ind1', baseWeight: 5, isHighway: true },
  { from: 'hw1', to: 'pt1', baseWeight: 9, isHighway: true },
  { from: 'hw1', to: 'tu2', baseWeight: 7, isHighway: true },
];

export function buildRawEdges(): GraphEdge[] {
  const edges: GraphEdge[] = [];
  let idx = 0;

  for (const raw of CITY_EDGES_RAW) {
    const isHighway = raw.isHighway ?? false;
    const forward: GraphEdge = {
      id: `e${idx++}`,
      from: raw.from,
      to: raw.to,
      baseWeight: raw.baseWeight,
      trafficMultiplier: 1.0,
      currentWeight: raw.baseWeight,
      congestionLevel: 'low',
      phase: Math.random() * Math.PI * 2,
      isHighway,
    };
    const reverse: GraphEdge = {
      id: `e${idx++}`,
      from: raw.to,
      to: raw.from,
      baseWeight: raw.baseWeight,
      trafficMultiplier: 1.0,
      currentWeight: raw.baseWeight,
      congestionLevel: 'low',
      phase: Math.random() * Math.PI * 2,
      isHighway,
    };
    edges.push(forward, reverse);
  }

  return edges;
}
