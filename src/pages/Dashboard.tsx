import type { AppState } from '../types';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { CycleTimeline } from '../components/dashboard/CycleTimeline';
import { BallotStatus } from '../components/dashboard/BallotStatus';
import { IdentityQuickView } from '../components/dashboard/IdentityQuickView';
import { ProposalActivity } from '../components/dashboard/ProposalActivity';
import { NetworkStats } from '../components/dashboard/NetworkStats';

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
      <DashboardHeader currentCycleName={currentCycle.name} />

      <DashboardStats
        identity={identity}
        ballotSubmissions={ballotSubmissions}
        proposals={proposals}
        ballotOptions={ballotOptions}
        daysRemaining={daysRemaining}
        participationRate={participationRate}
        onNavigate={onNavigate}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        <CycleTimeline calendarEvents={calendarEvents} />

        <BallotStatus
          rcvResult={rcvResult}
          ballotOptions={ballotOptions}
          ballotSubmissions={ballotSubmissions}
          onNavigate={onNavigate}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-6">
        <IdentityQuickView identity={identity} onNavigate={onNavigate} />

        <ProposalActivity proposals={proposals} onNavigate={onNavigate} />

        <NetworkStats />
      </div>
    </div>
  );
}
