import { Header } from './components/Header';
import { GraphCanvas } from './components/GraphCanvas';
import { ControlPanel } from './components/ControlPanel';
import { RouteInfoCard } from './components/RouteInfoCard';
import { TrafficLegend } from './components/TrafficLegend';
import { useTrafficSimulation } from './hooks/useTrafficSimulation';

function App() {
  useTrafficSimulation();

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 flex-shrink-0 flex flex-col gap-3 p-4 overflow-y-auto bg-slate-950 border-r border-slate-800">
          <ControlPanel />
          <RouteInfoCard />
        </aside>

        {/* Main canvas area */}
        <main className="flex-1 flex flex-col gap-2 p-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Click nodes to set start/end points · Coloured edges show real-time congestion
            </p>
            <TrafficLegend />
          </div>
          <div className="flex-1 min-h-0">
            <GraphCanvas />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
