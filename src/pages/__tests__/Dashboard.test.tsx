import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Dashboard } from '../Dashboard';
import type { AppState } from '../../types';

// Mock child components
vi.mock('../../components/dashboard/DashboardHeader', () => ({
  DashboardHeader: ({ currentCycleName }: { currentCycleName: string }) => <div data-testid="dashboard-header">{currentCycleName}</div>,
}));

vi.mock('../../components/dashboard/DashboardStats', () => ({
  DashboardStats: (props: { daysRemaining: number; participationRate: number }) => (
    <div data-testid="dashboard-stats">
      <div data-testid="days-remaining">{props.daysRemaining}</div>
      <div data-testid="participation-rate">{props.participationRate}</div>
    </div>
  ),
}));

vi.mock('../../components/dashboard/CycleTimeline', () => ({
  CycleTimeline: () => <div data-testid="cycle-timeline">Cycle Timeline</div>,
}));

vi.mock('../../components/dashboard/BallotStatus', () => ({
  BallotStatus: () => <div data-testid="ballot-status">Ballot Status</div>,
}));

vi.mock('../../components/dashboard/IdentityQuickView', () => ({
  IdentityQuickView: () => <div data-testid="identity-quick-view">Identity Quick View</div>,
}));

vi.mock('../../components/dashboard/ProposalActivity', () => ({
  ProposalActivity: () => <div data-testid="proposal-activity">Proposal Activity</div>,
}));

vi.mock('../../components/dashboard/NetworkStats', () => ({
  NetworkStats: () => <div data-testid="network-stats">Network Stats</div>,
}));

describe('Dashboard', () => {
  const mockNavigate = vi.fn();

  const mockState: AppState = {
    currentPage: '/dashboard',
    identity: {
      citizenId: 'test-123',
      status: 'active',
      verificationStep: 'complete',
      passportVerified: true,
      utilityVerified: true,
      vouchTokens: [],
      fraudStrikes: 0,
      isVouchingFor: [],
      createdAt: new Date(),
    },
    proposals: [
      { id: 'p1', title: 'Prop 1', content: '...', tier: 'law2_sandbox', submittedBy: '1', submittedAt: new Date(), status: 'draft' }
    ],
    ballotOptions: [],
    ballotSubmissions: [
      { voterId: 'v1', rankings: [], submittedAt: new Date() },
      { voterId: 'v2', rankings: [], submittedAt: new Date() }
    ],
    testAccounts: [
      { id: 'acc1', name: 'Acc 1', isBot: false, hasVoted: false, writeIns: [] },
      { id: 'acc2', name: 'Acc 2', isBot: false, hasVoted: false, writeIns: [] },
      { id: 'acc3', name: 'Acc 3', isBot: false, hasVoted: false, writeIns: [] }
    ],
    rcvResult: null,
    calendarEvents: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all child components', () => {
    render(<Dashboard state={mockState} onNavigate={mockNavigate} />);

    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument();
    expect(screen.getByTestId('cycle-timeline')).toBeInTheDocument();
    expect(screen.getByTestId('ballot-status')).toBeInTheDocument();
    expect(screen.getByTestId('identity-quick-view')).toBeInTheDocument();
    expect(screen.getByTestId('proposal-activity')).toBeInTheDocument();
    expect(screen.getByTestId('network-stats')).toBeInTheDocument();
  });

  it('calculates participation rate correctly', () => {
    render(<Dashboard state={mockState} onNavigate={mockNavigate} />);

    // Total possible voters = testAccounts.length (3) + 1 (the user) = 4
    // ballotSubmissions.length = 2
    // Expected participation rate = (2 / 4) * 100 = 50.0%
    expect(screen.getByTestId('participation-rate')).toHaveTextContent('50.0');
  });

  it('calculates participation rate as 0.0 when there are no submissions', () => {
    const stateWithNoSubmissions = {
      ...mockState,
      ballotSubmissions: [],
    };
    render(<Dashboard state={stateWithNoSubmissions} onNavigate={mockNavigate} />);

    expect(screen.getByTestId('participation-rate')).toHaveTextContent('0.0');
  });

  it('calculates days remaining correctly', () => {
    // Current date might change, but we know the formula for February 2024 Budget Initiative
    // endDate: new Date('2024-02-28')
    const endDate = new Date('2024-02-28');

    // Use fake timers to ensure deterministic testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-02-13T12:00:00Z'));

    const expectedDaysRemaining = Math.max(
      0,
      Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );

    render(<Dashboard state={mockState} onNavigate={mockNavigate} />);

    expect(screen.getByTestId('days-remaining')).toHaveTextContent(expectedDaysRemaining.toString());

    // Clean up timers
    vi.useRealTimers();
  });
});
