import { useAppStore } from '../store/appStore';
import { congestionColor, congestionLabel } from '../core/trafficSimulator';
import type { CongestionLevel } from '../types/graph.types';

function overallCongestion(levels: CongestionLevel[]): CongestionLevel {
  const score: Record<CongestionLevel, number> = { low: 0, moderate: 1, high: 2, gridlock: 3 };
  const avg = levels.reduce((s, l) => s + score[l], 0) / (levels.length || 1);
  if (avg < 0.5) return 'low';
  if (avg < 1.5) return 'moderate';
  if (avg < 2.5) return 'high';
  return 'gridlock';
}

export function RouteInfoCard() {
  const currentPath = useAppStore((s) => s.currentPath);
  const graphState = useAppStore((s) => s.graphState);
  const algorithm = useAppStore((s) => s.algorithm);
  const selectedStart = useAppStore((s) => s.selectedStart);
  const selectedEnd = useAppStore((s) => s.selectedEnd);

  if (!selectedStart || !selectedEnd) return null;

  if (!currentPath) {
    return (
      <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-400">
        No route found between the selected nodes.
      </div>
    );
  }

  const nodeLabels = currentPath.path.map(
    (id) => graphState.nodes.get(id)?.label ?? id
  );
  const congLevels = currentPath.edges.map((e) => e.congestionLevel);
  const overall = overallCongestion(congLevels);
  const color = congestionColor(overall);

  return (
    <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg flex flex-col gap-3">
      {/* Route path */}
      <div>
        <p className="text-xs text-slate-400 mb-1">Route</p>
        <p className="text-sm text-white leading-relaxed">
          {nodeLabels.join(' → ')}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-slate-800 rounded p-2">
          <p className="text-lg font-bold text-white">{currentPath.totalTime}<span className="text-xs font-normal text-slate-400"> min</span></p>
          <p className="text-xs text-slate-400">Est. Time</p>
        </div>
        <div className="bg-slate-800 rounded p-2">
          <p className="text-lg font-bold text-white">{currentPath.totalDistance}<span className="text-xs font-normal text-slate-400"> km</span></p>
          <p className="text-xs text-slate-400">Distance</p>
        </div>
        <div className="bg-slate-800 rounded p-2">
          <p className="text-lg font-bold text-white">{currentPath.hops}</p>
          <p className="text-xs text-slate-400">Hops</p>
        </div>
      </div>

      {/* Overall congestion bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Traffic Condition</span>
          <span style={{ color }}>{congestionLabel(overall)}</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: overall === 'low' ? '25%' : overall === 'moderate' ? '50%' : overall === 'high' ? '75%' : '100%',
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      {/* Algorithm meta */}
      <div className="flex justify-between text-xs text-slate-500 border-t border-slate-700 pt-2">
        <span>Algorithm: <span className="text-slate-300">{algorithm === 'dijkstra' ? "Dijkstra's" : 'A*'}</span></span>
        <span>Nodes explored: <span className="text-slate-300">{currentPath.nodesExplored}</span></span>
      </div>
    </div>
  );
}
