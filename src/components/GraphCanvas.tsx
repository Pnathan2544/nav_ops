import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { congestionColor } from '../core/trafficSimulator';
import type { GraphNode, GraphEdge } from '../types/graph.types';

const VIEWBOX = '0 0 1000 700';

function nodeColor(node: GraphNode, isStart: boolean, isEnd: boolean, isOnPath: boolean): string {
  if (isStart) return '#22d3ee';    // cyan
  if (isEnd) return '#f472b6';      // pink
  if (isOnPath) return '#a78bfa';   // violet
  switch (node.type) {
    case 'highway': return '#f59e0b';
    case 'district': return '#64748b';
    default: return '#475569';
  }
}

function nodeRadius(node: GraphNode, isStart: boolean, isEnd: boolean): number {
  if (isStart || isEnd) return 12;
  if (node.type === 'district') return 10;
  return 7;
}

interface EdgeMeta {
  edge: GraphEdge;
  x1: number; y1: number;
  x2: number; y2: number;
  midX: number; midY: number;
  isOnPath: boolean;
}

export function GraphCanvas() {
  const graphState = useAppStore((s) => s.graphState);
  const selectedStart = useAppStore((s) => s.selectedStart);
  const selectedEnd = useAppStore((s) => s.selectedEnd);
  const currentPath = useAppStore((s) => s.currentPath);
  const setStart = useAppStore((s) => s.setStart);
  const setEnd = useAppStore((s) => s.setEnd);
  const resetSelection = useAppStore((s) => s.resetSelection);

  // Use sorted pair keys so direction doesn't matter when checking path membership
  const pathEdgePairs = new Set(
    currentPath?.edges.map((e) => [e.from, e.to].sort().join('-')) ?? []
  );
  const pathNodeIds = new Set(currentPath?.path ?? []);

  // Build deduplicated edges for rendering (one line per physical road)
  const seen = new Set<string>();
  const edgeMetas: EdgeMeta[] = [];

  for (const edges of graphState.adjacency.values()) {
    for (const edge of edges) {
      const key = [edge.from, edge.to].sort().join('-');
      if (seen.has(key)) continue;
      seen.add(key);

      const from = graphState.nodes.get(edge.from)!;
      const to = graphState.nodes.get(edge.to)!;
      edgeMetas.push({
        edge,
        x1: from.x, y1: from.y,
        x2: to.x,   y2: to.y,
        midX: (from.x + to.x) / 2,
        midY: (from.y + to.y) / 2,
        isOnPath: pathEdgePairs.has(key),
      });
    }
  }

  const handleNodeClick = useCallback((nodeId: string) => {
    if (!selectedStart) {
      setStart(nodeId);
    } else if (!selectedEnd) {
      if (nodeId === selectedStart) return;
      setEnd(nodeId);
      // Auto-calculate after both are selected
      setTimeout(() => {
        useAppStore.getState().calculateRoute();
      }, 0);
    } else {
      // Third click: reset and start fresh
      resetSelection();
      setStart(nodeId);
    }
  }, [selectedStart, selectedEnd, setStart, setEnd, resetSelection]);

  const nodes = Array.from(graphState.nodes.values());

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
      <svg
        viewBox={VIEWBOX}
        className="w-full h-full"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        {/* Edge layer */}
        <g>
          {edgeMetas.map(({ edge, x1, y1, x2, y2, isOnPath }) => (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isOnPath ? '#a78bfa' : congestionColor(edge.congestionLevel)}
              strokeWidth={isOnPath ? 4 : (edge.isHighway ? 3 : 2)}
              strokeOpacity={isOnPath ? 1 : 0.55}
              strokeDasharray={isOnPath ? '10 5' : undefined}
              className={isOnPath ? 'path-edge' : undefined}
            />
          ))}
        </g>

        {/* Node layer */}
        <g>
          {nodes.map((node) => {
            const isStart = node.id === selectedStart;
            const isEnd = node.id === selectedEnd;
            const isOnPath = pathNodeIds.has(node.id) && !isStart && !isEnd;
            const r = nodeRadius(node, isStart, isEnd);
            const fill = nodeColor(node, isStart, isEnd, isOnPath);

            return (
              <g
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow ring for start/end */}
                {(isStart || isEnd) && (
                  <circle
                    cx={node.x} cy={node.y}
                    r={r + 6}
                    fill="none"
                    stroke={fill}
                    strokeWidth={2}
                    strokeOpacity={0.4}
                    className="node-pulse"
                  />
                )}
                <circle
                  cx={node.x} cy={node.y} r={r}
                  fill={fill}
                  stroke={isStart || isEnd ? fill : '#1e293b'}
                  strokeWidth={2}
                />
                {/* Label */}
                <text
                  x={node.x}
                  y={node.y + r + 14}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#94a3b8"
                  pointerEvents="none"
                >
                  {node.label}
                </text>
                {/* Start / End badge */}
                {(isStart || isEnd) && (
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight="bold"
                    fill="#0f172a"
                    pointerEvents="none"
                  >
                    {isStart ? 'S' : 'E'}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Click hint */}
      <div className="absolute bottom-3 left-3 text-xs text-slate-500">
        {!selectedStart
          ? 'Click a node to set Start'
          : !selectedEnd
          ? 'Click another node to set End'
          : 'Click any node to reset'}
      </div>
    </div>
  );
}
