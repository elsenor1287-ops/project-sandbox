import { Users, Play, RotateCcw } from 'lucide-react';

interface RCVHeaderProps {
  onGenerateMockVotes: (count: number) => void;
  onRunSimulation: () => void;
  onResetVoting: () => void;
  isSimulating: boolean;
  hasSubmissions: boolean;
}

export function RCVHeader({
  onGenerateMockVotes,
  onRunSimulation,
  onResetVoting,
  isSimulating,
  hasSubmissions,
}: RCVHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gradient">RCV Sandbox</h1>
        <p className="text-primary-400 mt-1">Month 2024-02 Instant Runoff Ballot</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onGenerateMockVotes(5)}
          className="btn-secondary"
          disabled={isSimulating}
        >
          <Users className="w-4 h-4" />
          Add 5 Mock Votes
        </button>
        <button
          onClick={onRunSimulation}
          className="btn-primary"
          disabled={!hasSubmissions || isSimulating}
        >
          <Play className="w-4 h-4" />
          {isSimulating ? 'Simulating...' : 'Run RCV Tally'}
        </button>
        <button onClick={onResetVoting} className="btn-ghost" disabled={isSimulating}>
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
}
