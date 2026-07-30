import { Shield, AlertTriangle, CheckCircle2, Vote, FileText, TrendingUp } from 'lucide-react';
import type { AppState } from '../../types';

interface DashboardStatsProps {
  identity: AppState['identity'];
  ballotSubmissions: AppState['ballotSubmissions'];
  proposals: AppState['proposals'];
  ballotOptions: AppState['ballotOptions'];
  daysRemaining: number;
  participationRate: string;
  onNavigate: (page: AppState['currentPage']) => void;
}

export function DashboardStats({
  identity,
  ballotSubmissions,
  proposals,
  ballotOptions,
  daysRemaining,
  participationRate,
  onNavigate,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div
        className="stat-card cursor-pointer hover:border-accent-500/50 transition-colors"
        onClick={() => onNavigate('/identity')}
      >
        <div className="flex items-center justify-between mb-4">
          <Shield className="w-6 h-6 text-accent-400" />
          <span
            className={`badge ${
              identity.status === 'active'
                ? 'badge-success'
                : identity.status === 'frozen'
                ? 'badge-danger'
                : 'badge-warning'
            }`}
          >
            {identity.status}
          </span>
        </div>
        <p className="text-3xl font-bold text-primary-100">
          {identity.status === 'active' ? '100%' : '0%'}
        </p>
        <p className="text-sm text-primary-400 mt-1">Identity Verification</p>
        <p className="text-xs text-primary-500 mt-2 flex items-center gap-1">
          {identity.fraudStrikes > 0 ? (
            <>
              <AlertTriangle className="w-3 h-3 text-danger-400" />
              {identity.fraudStrikes} fraud strikes
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 text-success-400" />
              No fraud warnings
            </>
          )}
        </p>
      </div>

      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <Vote className="w-6 h-6 text-success-400" />
          <span className="badge badge-success">Active</span>
        </div>
        <p className="text-3xl font-bold text-primary-100">{ballotSubmissions.length}</p>
        <p className="text-sm text-primary-400 mt-1">Votes Cast</p>
        <p className="text-xs text-primary-500 mt-2">{participationRate}% participation rate</p>
      </div>

      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <FileText className="w-6 h-6 text-warning-400" />
          <span className="badge badge-neutral">{proposals.length}</span>
        </div>
        <p className="text-3xl font-bold text-primary-100">{ballotOptions.length}</p>
        <p className="text-sm text-primary-400 mt-1">Active Ballot Options</p>
        <p className="text-xs text-primary-500 mt-2">
          {ballotOptions.filter(o => o.isWriteIn).length} write-in candidates
        </p>
      </div>

      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <TrendingUp className="w-6 h-6 text-accent-400" />
          <span className="badge badge-warning">{daysRemaining}d left</span>
        </div>
        <p className="text-3xl font-bold text-primary-100">
          ${ballotOptions.reduce((sum, o) => sum + o.budget, 0).toLocaleString()}
        </p>
        <p className="text-sm text-primary-400 mt-1">Total Budget in Ballot</p>
        <p className="text-xs text-primary-500 mt-2">
          {ballotOptions.length} initiatives proposed
        </p>
      </div>
    </div>
  );
}
