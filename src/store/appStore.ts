import { create } from 'zustand';
import type { GraphState, PathResult, AlgorithmType, GraphEdge } from '../types/graph.types';
import { buildGraphState, applyTrafficUpdate } from '../core/graph';
import { dijkstra } from '../core/dijkstra';
import { astar } from '../core/astar';

interface AppStore {
  graphState: GraphState;
  selectedStart: string | null;
  selectedEnd: string | null;
  algorithm: AlgorithmType;
  currentPath: PathResult | null;
  isSimulating: boolean;
  simulationInterval: number; // ms

  setStart: (nodeId: string) => void;
  setEnd: (nodeId: string) => void;
  setAlgorithm: (algo: AlgorithmType) => void;
  calculateRoute: () => void;
  updateTraffic: (updatedEdges: GraphEdge[]) => void;
  toggleSimulation: () => void;
  setSimulationInterval: (ms: number) => void;
  resetSelection: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  graphState: buildGraphState(),
  selectedStart: null,
  selectedEnd: null,
  algorithm: 'dijkstra',
  currentPath: null,
  isSimulating: false,
  simulationInterval: 3000,

  setStart: (nodeId) => set({ selectedStart: nodeId }),
  setEnd: (nodeId) => set({ selectedEnd: nodeId }),

  setAlgorithm: (algo) => {
    set({ algorithm: algo });
    // Re-run route with new algorithm immediately
    const { selectedStart, selectedEnd, graphState } = get();
    if (selectedStart && selectedEnd) {
      const result = algo === 'dijkstra'
        ? dijkstra(graphState, selectedStart, selectedEnd)
        : astar(graphState, selectedStart, selectedEnd);
      set({ currentPath: result });
    }
  },

  calculateRoute: () => {
    const { selectedStart, selectedEnd, algorithm, graphState } = get();
    if (!selectedStart || !selectedEnd) return;

    const result = algorithm === 'dijkstra'
      ? dijkstra(graphState, selectedStart, selectedEnd)
      : astar(graphState, selectedStart, selectedEnd);

    set({ currentPath: result });
  },

  updateTraffic: (updatedEdges) => {
    const { graphState, selectedStart, selectedEnd, algorithm, currentPath } = get();
    const newState = applyTrafficUpdate(graphState, updatedEdges);

    let newPath = currentPath;
    if (selectedStart && selectedEnd && currentPath) {
      newPath = algorithm === 'dijkstra'
        ? dijkstra(newState, selectedStart, selectedEnd)
        : astar(newState, selectedStart, selectedEnd);
    }

    set({ graphState: newState, currentPath: newPath });
  },

  toggleSimulation: () => set((s) => ({ isSimulating: !s.isSimulating })),
  setSimulationInterval: (ms) => set({ simulationInterval: ms }),
  resetSelection: () => set({ selectedStart: null, selectedEnd: null, currentPath: null }),
}));
