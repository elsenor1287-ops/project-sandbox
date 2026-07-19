import { Vote, Users, TrendingUp, BarChart3 } from 'lucide-react';

interface RCVStatsProps {
  votedCount: number;
  totalVoters: number;
  participationRate: number;
  activeOptionsCount: number;
}

export function RCVStats({
  votedCount,
  totalVoters,
  participationRate,
  activeOptionsCount,
}: RCVStatsProps) {
  return (
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
        <p className="text-3xl font-bold text-primary-100">{activeOptionsCount}</p>
        <p className="text-sm text-primary-400">Active Options</p>
      </div>
    </div>
  );
}
