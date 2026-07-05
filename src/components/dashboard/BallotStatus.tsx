import { BarChart3, ArrowRight, CheckCircle2, Vote } from 'lucide-react';
import type { AppState } from '../../types';

interface BallotStatusProps {
  rcvResult: AppState['rcvResult'];
  ballotOptions: AppState['ballotOptions'];
  ballotSubmissions: AppState['ballotSubmissions'];
  onNavigate: (page: AppState['currentPage']) => void;
}

export function BallotStatus({
  rcvResult,
  ballotOptions,
  ballotSubmissions,
  onNavigate,
}: BallotStatusProps) {
  return (
    <div className="card p-6 col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary-200 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Current RCV Ballot Status
        </h2>
        <button
          onClick={() => onNavigate('/vote')}
          className="btn-secondary text-sm"
        >
          View Ballot
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {rcvResult ? (
        <div className="card-elevated p-4 border-success-500/30 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success-400" />
            </div>
            <div>
              <p className="text-xs text-primary-400 uppercase tracking-wide">
                Current Leader
              </p>
              <p className="text-lg font-semibold text-success-300">
                {rcvResult.winner.title}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-primary-500 bg-primary-800/30 rounded-lg mb-6">
          <Vote className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No RCV tally run yet</p>
          <p className="text-sm">Submit votes and run the simulation</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {ballotOptions.slice(0, 4).map(option => {
          const voteCount = ballotSubmissions.filter(sub =>
            sub.rankings.some(r => r.optionId === option.id && r.rank === 1)
          ).length;
          const percentage =
            ballotSubmissions.length > 0
              ? (voteCount / ballotSubmissions.length) * 100
              : 0;

          return (
            <div key={option.id} className="card-elevated p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-primary-200 truncate text-sm">
                  {option.title}
                </p>
                <span className="text-xs text-primary-400">{percentage.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-primary-700 rounded overflow-hidden">
                <div
                  className="h-full bg-accent-500 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-primary-500 mt-2">
                {voteCount} first-choice votes
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
