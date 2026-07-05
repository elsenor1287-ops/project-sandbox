import {
  Calendar,
  Vote,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  FileText,
} from 'lucide-react';
import type { AppState } from '../types';

interface DashboardProps {
  state: AppState;
  onNavigate: (page: AppState['currentPage']) => void;
}

export function Dashboard({ state, onNavigate }: DashboardProps) {
  const { identity, ballotOptions, ballotSubmissions, proposals, calendarEvents, rcvResult } = state;

  const currentCycle = {
    name: 'February 2024 Budget Initiative',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-28'),
    ballotStatus: ballotSubmissions.length > 0 ? 'active' : 'pending',
    proposals: proposals.length,
    votes: ballotSubmissions.length,
  };

  const daysRemaining = Math.max(
    0,
    Math.ceil((currentCycle.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const participationRate =
    ballotSubmissions.length > 0
      ? ((ballotSubmissions.length / (state.testAccounts.length + 1)) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Governance Dashboard</h1>
          <p className="text-primary-400 mt-1">Real-time overview of Project Sandbox</p>
        </div>
        <div className="flex items-center gap-3 bg-primary-800/50 px-4 py-2 rounded-lg border border-primary-700">
          <Clock className="w-5 h-5 text-primary-400" />
          <div>
            <p className="text-sm text-primary-300">Current Cycle</p>
            <p className="text-xs text-primary-500">{currentCycle.name}</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
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
          <p className="text-xs text-primary-500 mt-2">6 initiatives proposed</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Calendar Timeline */}
        <div className="card p-6 col-span-1">
          <h2 className="text-lg font-semibold text-primary-200 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Cycle Timeline
          </h2>
          <div className="relative pl-6 space-y-6">
            {/* Timeline line */}
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-primary-700" />

            {calendarEvents.map((event) => {
              const isPast = event.date < new Date();
              const isCurrent = Math.abs(event.date.getTime() - Date.now()) < 86400000;

              return (
                <div key={event.id} className="relative">
                  <div
                    className={`absolute -left-4 w-3 h-3 rounded-full ${
                      isPast
                        ? 'bg-success-500'
                        : isCurrent
                        ? 'bg-accent-500 animate-pulse'
                        : 'bg-primary-600'
                    }`}
                  />
                  <div
                    className={`p-3 rounded-lg ${
                      isCurrent
                        ? 'bg-accent-500/10 border border-accent-500/30'
                        : 'bg-primary-800/30'
                    }`}
                  >
                    <p className="font-medium text-primary-200">{event.title}</p>
                    <p className="text-xs text-primary-400 mt-1">
                      {event.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Ballot Status */}
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
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Identity Quick View */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary-200">Identity Status</h2>
            <button
              onClick={() => onNavigate('/identity')}
              className="text-sm text-accent-400 hover:text-accent-300"
            >
              Manage
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-400">Citizen ID</span>
              <span className="font-mono text-primary-200 text-sm">{identity.citizenId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-400">Passport Verified</span>
              {identity.passportVerified ? (
                <CheckCircle2 className="w-5 h-5 text-success-400" />
              ) : (
                <span className="text-xs text-warning-400">Pending</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-400">Utility Linked</span>
              {identity.utilityVerified ? (
                <CheckCircle2 className="w-5 h-5 text-success-400" />
              ) : (
                <span className="text-xs text-warning-400">Pending</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-400">Neighbor Vouches</span>
              <span className="text-sm text-primary-200">
                {identity.vouchTokens.length}/3
              </span>
            </div>
          </div>
        </div>

        {/* Proposal Activity */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary-200">Proposal Activity</h2>
            <button
              onClick={() => onNavigate('/compiler')}
              className="text-sm text-accent-400 hover:text-accent-300"
            >
              Compile
            </button>
          </div>

          {proposals.length === 0 ? (
            <div className="text-center py-8 text-primary-500">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No proposals submitted</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proposals.slice(-3).reverse().map(p => (
                <div
                  key={p.id}
                  className="p-3 bg-primary-800/30 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-primary-200">{p.title}</p>
                    <p className="text-xs text-primary-500">{p.tier}</p>
                  </div>
                  <span
                    className={`badge ${
                      p.status === 'compiled' ? 'badge-success' : 'badge-danger'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Network Stats */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-primary-200 mb-4">Network Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-400">Active Validators</span>
              <span className="text-success-400 font-medium">128/128</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-400">Avg Block Time</span>
              <span className="text-primary-200">2.4s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-400">TPS</span>
              <span className="text-primary-200">12,847</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-400">Fees Today</span>
              <span className="text-primary-200">$0.00012 avg</span>
            </div>
            <div className="pt-3 border-t border-primary-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success-400 animate-pulse" />
                <span className="text-sm text-success-400">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
