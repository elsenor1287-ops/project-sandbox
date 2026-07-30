import { useState, useMemo } from 'react';
import { Building2, Home } from 'lucide-react';
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
  const [scope, setScope] = useState<'city' | 'local'>('city');

  const filteredBallotOptions = useMemo(() => {
    if (scope === 'city') {
      return ballotOptions.filter(o => o.id === 'opt-1' || o.id === 'opt-2' || o.id === 'opt-5');
    } else {
      return ballotOptions.filter(o => o.id === 'opt-3' || o.id === 'opt-4' || o.id === 'opt-6' || o.isWriteIn);
    }
  }, [ballotOptions, scope]);

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

      {/* Scope Toggle Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary-900/40 border border-primary-800/80 rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-6 bg-accent-500 rounded-full" />
          <div>
            <h3 className="text-sm font-semibold text-primary-100">Jurisdictional Scope Filter</h3>
            <p className="text-xs text-primary-400">Displaying data matching chosen charter domain</p>
          </div>
        </div>
        
        <div className="inline-flex bg-primary-950/80 border border-primary-800 rounded-full p-1 self-start sm:self-auto shadow-inner relative">
          <button
            onClick={() => setScope('city')}
            className={`px-5 py-2 text-xs font-semibold rounded-full transition-all duration-300 flex items-center gap-2 select-none cursor-pointer ${
              scope === 'city'
                ? 'bg-primary-100 text-primary-950 font-bold shadow-md'
                : 'text-primary-400 hover:text-primary-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Tampa City-Wide Mandates
          </button>
          <button
            onClick={() => setScope('local')}
            className={`px-5 py-2 text-xs font-semibold rounded-full transition-all duration-300 flex items-center gap-2 select-none cursor-pointer ${
              scope === 'local'
                ? 'bg-primary-100 text-primary-950 font-bold shadow-md'
                : 'text-primary-400 hover:text-primary-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            My Local Neighborhood
          </button>
        </div>
      </div>

      <DashboardStats
        identity={identity}
        ballotSubmissions={ballotSubmissions}
        proposals={proposals}
        ballotOptions={filteredBallotOptions}
        daysRemaining={daysRemaining}
        participationRate={participationRate}
        onNavigate={onNavigate}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        <CycleTimeline calendarEvents={calendarEvents} />

        <BallotStatus
          rcvResult={rcvResult}
          ballotOptions={filteredBallotOptions}
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
