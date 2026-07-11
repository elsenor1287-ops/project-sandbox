import { useState, useMemo } from 'react';
import {
  Vote,
  BarChart3,
  Users,
  Play,
  RotateCcw,
  Check,
  ChevronUp,
  ChevronDown,
  Trophy,
  TrendingUp,
  Plus,
  X,
} from 'lucide-react';
import type { BallotOption, BallotSubmission, RCVResult, TestAccount } from '../types';

interface VotingPageProps {
  ballotOptions: BallotOption[];
  submissions: BallotSubmission[];
  testAccounts: TestAccount[];
  rcvResult: RCVResult | null;
  onSubmitBallot: (submission: Omit<BallotSubmission, 'submittedAt'>) => void;
  onRunSimulation: () => void;
  onGenerateMockVotes: (count: number) => void;
  onResetVoting: () => void;
}

interface RankedItem {
  optionId: string;
  rank: number;
}

export function VotingPage({
  ballotOptions,
  submissions,
  testAccounts,
  rcvResult,
  onSubmitBallot,
  onRunSimulation,
  onGenerateMockVotes,
  onResetVoting,
}: VotingPageProps) {
  const [rankings, setRankings] = useState<RankedItem[]>([]);
  const [writeIn, setWriteIn] = useState('');
  const [showWriteInInput, setShowWriteInInput] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationRound, setSimulationRound] = useState(0);

  const handleSubmit = () => {
    onSubmitBallot({
      voterId: 'CITIZEN-2024-01337',
      rankings: rankings.map(r => ({ optionId: r.optionId, rank: r.rank })),
      writeIn: writeIn || undefined,
    });
    setRankings([]);
    setWriteIn('');
    setShowWriteInInput(false);
  };

  const handleRank = (optionId: string, newRank: number) => {
    setRankings(prev => {
      const existing = prev.find(r => r.optionId === optionId);
      if (existing) {
        if (newRank === 0) {
          return prev.filter(r => r.optionId !== optionId);
        }
        // Shift others down
        const others = prev.filter(r => r.optionId !== optionId);
        const shifted = others.map(r => ({
          ...r,
          rank: r.rank >= newRank ? r.rank + 1 : r.rank,
        }));
        return [...shifted, { optionId, rank: newRank }].sort((a, b) => a.rank - b.rank);
      }
      return [...prev, { optionId, rank: newRank }].sort((a, b) => a.rank - b.rank);
    });
  };

  const getRank = (optionId: string) => rankings.find(r => r.optionId === optionId)?.rank || 0;

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationRound(0);
    onRunSimulation();

    // Animate through rounds
    const result = calculateRCVResult(ballotOptions, submissions);
    for (let i = 0; i < result.rounds.length; i++) {
      await new Promise(r => setTimeout(r, 1000));
      setSimulationRound(i + 1);
    }
    setIsSimulating(false);
  };

  const votedCount = submissions.length;
  const totalVoters = testAccounts.length + 1;
  const participationRate = (votedCount / totalVoters) * 100;


  return (
    <div className="p-8 space-y-8">
      {/* Header */}
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
            onClick={handleRunSimulation}
            className="btn-primary"
            disabled={submissions.length === 0 || isSimulating}
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

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card">
          <Vote className="w-5 h-5 text-accent-400 mb-2" />
          <p className="text-3xl font-bold text-primary-100">{votedCount}</p>
          <p className="text-sm text-primary-400">Votes Cast</p>
        </div>
        <div className="stat-card">
          <Users className="w-5 h-5 text-success-400 mb-2" />
          <p className="text-3xl font-bold text-primary-100">{totalVoters}</p>
          <p className="text-sm text-primary-400">Total Voters</p>
        </div>
        <div className="stat-card">
          <TrendingUp className="w-5 h-5 text-warning-400 mb-2" />
          <p className="text-3xl font-bold text-primary-100">{participationRate.toFixed(1)}%</p>
          <p className="text-sm text-primary-400">Participation Rate</p>
        </div>
        <div className="stat-card">
          <BarChart3 className="w-5 h-5 text-accent-400 mb-2" />
          <p className="text-3xl font-bold text-primary-100">{ballotOptions.length}</p>
          <p className="text-sm text-primary-400">Active Options</p>
        </div>
      </div>

      {/* Ballot Interface */}
      <div className="grid grid-cols-2 gap-6">
        {/* Ballot */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-primary-200 mb-4 flex items-center gap-2">
            <Vote className="w-5 h-5" />
            Ranked-Choice Ballot
            {rankings.length > 0 && (
              <span className="badge-success ml-auto">
                {rankings.length} Ranked
              </span>
            )}
          </h2>

          <p className="text-sm text-primary-400 mb-6">
            Click rank buttons to order your preferences (1st, 2nd, 3rd...). Lower number = higher preference.
          </p>

          <div className="space-y-3">
            {ballotOptions.map(option => {
              const currentRank = getRank(option.id);
              return (
                <div
                  key={option.id}
                  className={`card-elevated p-4 transition-all ${
                    currentRank > 0 ? 'border-accent-500/50 bg-accent-500/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Controls */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleRank(option.id, currentRank > 0 ? currentRank - 1 || 1 : 1)}
                        className="w-8 h-6 rounded flex items-center justify-center bg-primary-700 hover:bg-primary-600 text-primary-300 hover:text-primary-100 transition-colors"
                        disabled={currentRank === 0}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <div className="w-8 h-8 rounded-lg bg-primary-700 flex items-center justify-center">
                        <span className={`font-mono font-bold ${currentRank > 0 ? 'text-accent-300' : 'text-primary-500'}`}>
                          {currentRank || '-'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRank(option.id, currentRank + 1)}
                        className="w-8 h-6 rounded flex items-center justify-center bg-primary-700 hover:bg-primary-600 text-primary-300 hover:text-primary-100 transition-colors"
                        disabled={currentRank === 0}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Option Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-primary-200">{option.title}</h4>
                        {option.isWriteIn && <span className="badge-warning">Write-In</span>}
                      </div>
                      <p className="text-sm text-primary-400 line-clamp-2">{option.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-primary-500">
                          Budget: ${option.budget.toLocaleString()}
                        </span>
                        <span className="text-xs text-primary-400 uppercase">{option.category}</span>
                        {option.writeInCount && (
                          <span className="text-xs text-success-400">
                            {option.writeInCount} write-in votes
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Rank Buttons */}
                    <div className="flex gap-1 flex-wrap justify-end max-w-[200px]">
                      {[1, 2, 3, 4, 5].map(rank => (
                        <button
                          key={rank}
                          onClick={() => handleRank(option.id, rank)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                            currentRank === rank
                              ? 'bg-accent-500 text-white'
                              : 'bg-primary-700 text-primary-400 hover:bg-primary-600 hover:text-primary-200'
                          }`}
                        >
                          {rank}
                        </button>
                      ))}
                      {currentRank > 0 && (
                        <button
                          onClick={() => handleRank(option.id, 0)}
                          className="w-9 h-9 rounded-lg bg-danger-500/20 text-danger-400 hover:bg-danger-500/30 flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Write-In Option */}
            {!showWriteInInput ? (
              <button
                onClick={() => setShowWriteInInput(true)}
                className="w-full card-elevated p-4 border-dashed border-2 border-primary-600 hover:border-accent-500 text-primary-400 hover:text-accent-400 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Write-In Candidate
              </button>
            ) : (
              <div className="card-elevated p-4 border-warning-500/50">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={writeIn}
                    onChange={e => setWriteIn(e.target.value)}
                    className="input flex-1"
                    placeholder="Enter your write-in candidate name..."
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setShowWriteInInput(false);
                      setWriteIn('');
                    }}
                    className="btn-ghost"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-warning-400 mt-2">
                  Write-ins repeated by multiple voters become rankable options
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={rankings.length === 0}
            className="btn-success w-full mt-6"
          >
            <Check className="w-4 h-4" />
            Submit Ballot
          </button>
        </div>

        {/* RCV Results / Simulation */}
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
                          Eliminated: {ballotOptionsMap.get(round.eliminatedOptionId!)?.title}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {Object.entries(round.voteDistribution).map(([id, count]) => {
                        const option = ballotOptionsMap.get(id);
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
      </div>

      {/* Recent Submissions */}
      {submissions.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-primary-200 mb-4 flex items-center justify-between">
            <span>Recent Ballot Submissions</span>
            <span className="text-sm text-primary-400">{submissions.length} total</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-primary-400 border-b border-primary-700">
                  <th className="pb-3 font-medium">Voter</th>
                  <th className="pb-3 font-medium">Rankings</th>
                  <th className="pb-3 font-medium">Write-In</th>
                  <th className="pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {submissions.slice(-10).reverse().map((sub, idx) => {
                  const voter = accountsMap.get(sub.voterId) || testAccountsMap.get(sub.voterId);
                  return (
                    <tr key={idx} className="border-b border-primary-700/50">
                      <td className="py-3 text-primary-200">
                        {voter?.name || 'You'}
                      </td>
                      <td className="py-3 text-primary-300">
                        {[...sub.rankings].sort((a, b) => a.rank - b.rank).map(r => {
                          const opt = optionsMap.get(r.optionId) || ballotOptionsMap.get(r.optionId);
                          return `${r.rank}: ${opt?.title || 'Unknown'}`;
                        }).join(' → ')}
                      </td>
                      <td className="py-3 text-primary-400">
                        {sub.writeIn || '-'}
                      </td>
                      <td className="py-3 text-primary-500">
                        {sub.submittedAt.toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// RCV Calculation function for simulation
function calculateRCVResult(
  options: BallotOption[],
  submissions: BallotSubmission[]
): RCVResult {
  const rounds: { roundNumber: number; eliminatedOptionId?: string; voteDistribution: Record<string, number>; threshold: number; winner?: string; totalVotes: number }[] = [];
  let currentOptions = [...options];
  let currentRankings = submissions.map(sub => [...sub.rankings].sort((a, b) => a.rank - b.rank));

  const totalVotes = submissions.length;
  const threshold = totalVotes / 2;

  let roundNumber = 0;
  let winner: BallotOption | undefined;

  while (!winner && currentOptions.length > 1 && roundNumber < 10) {
    roundNumber++;

    const voteDistribution: Record<string, number> = {};
    currentOptions.forEach(opt => voteDistribution[opt.id] = 0);

    currentRankings.forEach(rankings => {
      const firstChoice = rankings[0];
      if (firstChoice && Object.prototype.hasOwnProperty.call(voteDistribution, firstChoice.optionId)) {
        voteDistribution[firstChoice.optionId]++;
      }
    });

    const maxVotes = Math.max(...Object.values(voteDistribution));
    if (maxVotes > threshold) {
      const winnerId = Object.keys(voteDistribution).find(id => voteDistribution[id] === maxVotes);
      winner = currentOptions.find(opt => opt.id === winnerId);
      rounds.push({ roundNumber, voteDistribution, threshold, winner: winnerId, totalVotes });
      break;
    }

    const minVotes = Math.min(...Object.values(voteDistribution));
    const loserId = Object.keys(voteDistribution).find(id => voteDistribution[id] === minVotes)!;

    currentOptions = currentOptions.filter(opt => opt.id !== loserId);
    currentRankings = currentRankings.map(rankings =>
      rankings.filter(r => currentOptions.some(opt => opt.id === r.optionId))
    );

    rounds.push({ roundNumber, eliminatedOptionId: loserId, voteDistribution, threshold, totalVotes });
  }

  if (!winner) winner = currentOptions[0];

  return { rounds, winner: winner!, totalVotes, completedAt: new Date() };
}
