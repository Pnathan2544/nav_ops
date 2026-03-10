import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { simulateTrafficStep } from '../core/trafficSimulator';
import { getAllEdges } from '../core/graph';

export function useTrafficSimulation() {
  const isSimulating = useAppStore((s) => s.isSimulating);
  const simulationInterval = useAppStore((s) => s.simulationInterval);
  const graphState = useAppStore((s) => s.graphState);
  const updateTraffic = useAppStore((s) => s.updateTraffic);

  // Keep refs to avoid stale closures in setInterval
  const graphRef = useRef(graphState);
  useEffect(() => { graphRef.current = graphState; }, [graphState]);

  useEffect(() => {
    if (!isSimulating) return;

    const id = setInterval(() => {
      const edges = getAllEdges(graphRef.current);
      const updated = simulateTrafficStep(edges);
      updateTraffic(updated);
    }, simulationInterval);

    return () => clearInterval(id);
  }, [isSimulating, simulationInterval, updateTraffic]);
}
