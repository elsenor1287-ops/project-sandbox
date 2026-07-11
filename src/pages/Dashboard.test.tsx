import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import type { AppState } from '../types';

const defaultAppState: AppState = {
  currentPage: '/dashboard',
  identity: {
    citizenId: '123',
    status: 'active',
    verificationStep: 'complete',
    passportVerified: true,
    utilityVerified: true,
    vouchTokens: [],
    fraudStrikes: 0,
    isVouchingFor: [],
    createdAt: new Date('2024-01-01'),
  },
  proposals: [],
  ballotOptions: [],
  ballotSubmissions: [],
  testAccounts: [
    { id: 't1', name: 'Test 1', isBot: false, hasVoted: false, writeIns: [] },
    { id: 't2', name: 'Test 2', isBot: false, hasVoted: false, writeIns: [] },
    { id: 't3', name: 'Test 3', isBot: false, hasVoted: false, writeIns: [] },
  ],
  rcvResult: null,
  calendarEvents: [],
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-02-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders all main sections and checks navigation buttons', () => {
    const onNavigateMock = vi.fn();
    render(<Dashboard state={defaultAppState} onNavigate={onNavigateMock} />);

    // DashboardHeader
    expect(screen.getByText('February 2024 Budget Initiative')).toBeInTheDocument();

    // DashboardStats (Check for days remaining calculation)
    // 2024-02-28 minus 2024-02-15 is 13 days
    expect(screen.getByText('13d left')).toBeInTheDocument();
    // 0 submissions means 0.0% participation rate
    expect(screen.getByText('0.0% participation rate')).toBeInTheDocument();

    // Check presence of child components
    expect(screen.getByText('Cycle Timeline')).toBeInTheDocument();
    expect(screen.getByText('Current RCV Ballot Status')).toBeInTheDocument();
    expect(screen.getByText('Identity Status')).toBeInTheDocument();
    expect(screen.getByText('Proposal Activity')).toBeInTheDocument();
    expect(screen.getByText('Network Status')).toBeInTheDocument();

    // Check interaction for IdentityQuickView
    const manageBtn = screen.getByText('Manage');
    fireEvent.click(manageBtn);
    expect(onNavigateMock).toHaveBeenCalledWith('/identity');

    // Check interaction for BallotStatus
    const viewBallotBtn = screen.getByText('View Ballot');
    fireEvent.click(viewBallotBtn);
    expect(onNavigateMock).toHaveBeenCalledWith('/vote');

    // Check interaction for ProposalActivity
    const compileBtn = screen.getByText('Compile');
    fireEvent.click(compileBtn);
    expect(onNavigateMock).toHaveBeenCalledWith('/compiler');
  });

  it('renders correctly with populated app state', () => {
    const onNavigateMock = vi.fn();
    const populatedState: AppState = {
      ...defaultAppState,
      rcvResult: {
        winner: { id: 'o1', title: 'Winner Proposal' },
        rounds: [],
      },
      proposals: [
        { id: 'p1', title: 'Test Proposal', tier: 'Tier 1', status: 'compiled', creatorId: '123', content: '...', endorsements: [], requiredEndorsements: 5 },
      ],
      calendarEvents: [
        { id: 'e1', title: 'Test Event', date: new Date('2024-02-15T12:00:00Z'), type: 'milestone' },
      ],
    };

    render(<Dashboard state={populatedState} onNavigate={onNavigateMock} />);

    // Check rcvResult presentation in BallotStatus
    expect(screen.getByText('Current Leader')).toBeInTheDocument();
    expect(screen.getByText('Winner Proposal')).toBeInTheDocument();

    // Check proposals presentation in ProposalActivity
    expect(screen.getByText('Test Proposal')).toBeInTheDocument();
    expect(screen.getByText('Tier 1')).toBeInTheDocument();
    expect(screen.getByText('compiled')).toBeInTheDocument();

    // Check calendar events presentation in CycleTimeline
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('calculates participation rate correctly when there are submissions', () => {
    const onNavigateMock = vi.fn();
    const stateWithSubmissions: AppState = {
      ...defaultAppState,
      ballotSubmissions: [
        { voterId: 'v1', rankings: [], submittedAt: new Date() },
        { voterId: 'v2', rankings: [], submittedAt: new Date() },
      ],
    };

    // Total users: testAccounts.length (3) + 1 (current user) = 4
    // Submissions: 2
    // Rate: 2/4 = 50.0%

    render(<Dashboard state={stateWithSubmissions} onNavigate={onNavigateMock} />);
    expect(screen.getByText('50.0% participation rate')).toBeInTheDocument();
  });

  it('handles negative days remaining by showing 0', () => {
    const onNavigateMock = vi.fn();
    vi.setSystemTime(new Date('2024-03-15T12:00:00Z'));

    render(<Dashboard state={defaultAppState} onNavigate={onNavigateMock} />);
    expect(screen.getByText('0d left')).toBeInTheDocument();
  });
});
