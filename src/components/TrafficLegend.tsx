import { congestionColor, congestionLabel } from '../core/trafficSimulator';
import type { CongestionLevel } from '../types/graph.types';

const LEVELS: CongestionLevel[] = ['low', 'moderate', 'high', 'gridlock'];

export function TrafficLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs">
      {LEVELS.map((level) => (
        <div key={level} className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: congestionColor(level) }}
          />
          <span className="text-slate-400">{congestionLabel(level)}</span>
        </div>
      ))}
    </div>
  );
}
