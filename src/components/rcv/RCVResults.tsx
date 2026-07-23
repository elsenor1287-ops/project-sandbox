import { useMemo } from 'react';
import { BarChart3, Trophy } from 'lucide-react';
import type { RCVResult, BallotOption } from '../../types';

interface RCVResultsProps {
  rcvResult: RCVResult | null;
  simulationRound: number;
  optionsMap: Map<string, BallotOption>;
}

export function RCVResults({
  rcvResult,
  simulationRound,
  optionsMap,
}: RCVResultsProps) {
  const memoizedDistributions = useMemo(() => {
    if (!rcvResult) return [];
    return rcvResult.rounds.map(round => Object.entries(round.voteDistribution));
  }, [rcvResult]);

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-primary-200 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Instant-Runoff Tally
      </h2>

      {!rcvResult ? (
        <div className="text-center py-16 text-primary-500">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Run RCV Tally to see results</p>
          <p className="text-sm mt-1">Requires at least 1 submitted ballot</p>
        </div>
      ) : (
        <div className="space-y-4 animate-in">
          {/* Winner Announcement */}
          <div className="card-elevated p-6 border-success-500/30 text-center glow-success">
            <Trophy className="w-10 h-10 text-success-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-success-300 mb-1">
              {rcvResult.winner.title}
            </h3>
            <p className="text-sm text-primary-400">Winner after {rcvResult.rounds.length} rounds</p>
            <p className="text-lg text-primary-300 mt-2">
              Total Votes: {rcvResult.totalVotes}
            </p>
          </div>

          {/* Round Animation */}
          <div className="space-y-3">
            <h4 className="font-medium text-primary-300">Runoff Rounds</h4>
            {rcvResult.rounds.slice(0, simulationRound || undefined).map((round, idx) => (
              <div key={idx} className="card-elevated p-4 animate-in">
                <div className="flex items-center justify-between mb-3">
                  <span className="badge-neutral">Round {round.roundNumber}</span>
                  {round.winner ? (
                    <span className="badge-success">Winner Declared</span>
                  ) : (
                    <span className="text-xs text-danger-400">
                      Eliminated: {optionsMap.get(round.eliminatedOptionId!)?.title}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {memoizedDistributions[idx]?.map(([id, count]) => {
                    const option = optionsMap.get(id);
                    const percentage = (count / round.totalVotes) * 100;
                    const isWinner = round.winner === id;
                    const isEliminated = round.eliminatedOptionId === id;
                    return (
                      <div key={id} className="flex items-center gap-3">
                        <span
                          className={`w-24 text-sm truncate ${
                            isWinner
                              ? 'text-success-300 font-medium'
                              : isEliminated
                              ? 'text-danger-300 line-through'
                              : 'text-primary-300'
                          }`}
                        >
                          {option?.title}
                        </span>
                        <div className="flex-1 h-6 bg-primary-700/50 rounded overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isWinner
                                ? 'bg-success-500'
                                : isEliminated
                                ? 'bg-danger-500'
                                : 'bg-accent-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-primary-300 w-24 text-right">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-xs text-primary-500">
                  Threshold: 50% ({Math.round(round.threshold)} votes needed)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
