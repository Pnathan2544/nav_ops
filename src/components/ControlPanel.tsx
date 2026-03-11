import { useAppStore } from '../store/appStore';
import { CITY_NODES } from '../data/cityGraph';
import type { AlgorithmType } from '../types/graph.types';

export function ControlPanel() {
  const selectedStart = useAppStore((s) => s.selectedStart);
  const selectedEnd = useAppStore((s) => s.selectedEnd);
  const algorithm = useAppStore((s) => s.algorithm);
  const isSimulating = useAppStore((s) => s.isSimulating);
  const simulationInterval = useAppStore((s) => s.simulationInterval);
  const setStart = useAppStore((s) => s.setStart);
  const setEnd = useAppStore((s) => s.setEnd);
  const setAlgorithm = useAppStore((s) => s.setAlgorithm);
  const calculateRoute = useAppStore((s) => s.calculateRoute);
  const toggleSimulation = useAppStore((s) => s.toggleSimulation);
  const setSimulationInterval = useAppStore((s) => s.setSimulationInterval);
  const resetSelection = useAppStore((s) => s.resetSelection);

  const handleStartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStart(e.target.value);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEnd(e.target.value);
    if (selectedStart) {
      setTimeout(() => useAppStore.getState().calculateRoute(), 0);
    }
  };

  const sortedNodes = [...CITY_NODES].sort((a, b) =>
    a.zone.localeCompare(b.zone) || a.label.localeCompare(b.label)
  );

  const selectClass =
    'w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500';

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900 border border-slate-700 rounded-lg">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Route Settings
      </h2>

      {/* Node selectors */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-400">Start Node</label>
        <select
          className={selectClass}
          value={selectedStart ?? ''}
          onChange={handleStartChange}
        >
          <option value="" disabled>Select start…</option>
          {sortedNodes.map((n) => (
            <option key={n.id} value={n.id} disabled={n.id === selectedEnd}>
              {n.zone} — {n.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-400">End Node</label>
        <select
          className={selectClass}
          value={selectedEnd ?? ''}
          onChange={handleEndChange}
        >
          <option value="" disabled>Select end…</option>
          {sortedNodes.map((n) => (
            <option key={n.id} value={n.id} disabled={n.id === selectedStart}>
              {n.zone} — {n.label}
            </option>
          ))}
        </select>
      </div>

      {/* Algorithm toggle */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-400">Algorithm</label>
        <div className="flex rounded overflow-hidden border border-slate-600">
          {(['dijkstra', 'astar'] as AlgorithmType[]).map((algo) => (
            <button
              key={algo}
              onClick={() => setAlgorithm(algo)}
              className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                algorithm === algo
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {algo === 'dijkstra' ? "Dijkstra's" : 'A*'}
            </button>
          ))}
        </div>
      </div>

      {/* Calculate button */}
      <button
        onClick={calculateRoute}
        disabled={!selectedStart || !selectedEnd}
        className="w-full py-2 rounded bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold transition-colors"
      >
        Calculate Route
      </button>

      <button
        onClick={resetSelection}
        className="w-full py-1.5 rounded border border-slate-600 text-slate-400 hover:text-white text-xs transition-colors"
      >
        Reset
      </button>

      {/* Traffic simulation */}
      <div className="border-t border-slate-700 pt-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Traffic Simulation
        </h2>

        <button
          onClick={toggleSimulation}
          className={`w-full py-2 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            isSimulating
              ? 'bg-red-700 hover:bg-red-600 text-white'
              : 'bg-emerald-700 hover:bg-emerald-600 text-white'
          }`}
        >
          {isSimulating && (
            <span className="inline-block w-2 h-2 rounded-full bg-green-300 animate-pulse" />
          )}
          {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
        </button>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 flex justify-between">
            <span>Update Interval</span>
            <span>{simulationInterval / 1000}s</span>
          </label>
          <input
            type="range"
            min={1000}
            max={10000}
            step={500}
            value={simulationInterval}
            onChange={(e) => setSimulationInterval(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
        </div>
      </div>
    </div>
  );
}
