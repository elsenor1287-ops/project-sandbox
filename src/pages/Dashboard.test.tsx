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

  it('renders all main sections', () => {
    const onNavigateMock = vi.fn();
    render(<Dashboard state={defaultAppState} onNavigate={onNavigateMock} />);

    // DashboardHeader
    expect(screen.getByText('February 2024 Budget Initiative')).toBeInTheDocument();

    // DashboardStats (Check for days remaining calculation)
    // 2024-02-28 minus 2024-02-15 is 13 days
    expect(screen.getByText('13d left')).toBeInTheDocument();
    // 0 submissions means 0.0% participation rate
    expect(screen.getByText('0.0% participation rate')).toBeInTheDocument();
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

  it('renders identity status and triggers navigation', () => {
    const onNavigateMock = vi.fn();
    const state: AppState = {
      ...defaultAppState,
      identity: {
        ...defaultAppState.identity,
        status: 'frozen',
        fraudStrikes: 2,
        passportVerified: false,
        utilityVerified: false,
      }
    };

    render(<Dashboard state={state} onNavigate={onNavigateMock} />);

    // Check DashboardStats identity card
    expect(screen.getByText('0%')).toBeInTheDocument(); // 0% identity completion because frozen
    expect(screen.getByText('2 fraud strikes')).toBeInTheDocument();

    // Check IdentityQuickView
    const pendingElements = screen.getAllByText('Pending');
    expect(pendingElements).toHaveLength(2); // Passport and Utility

    // Trigger navigation from IdentityQuickView
    const manageButton = screen.getByText('Manage');
    fireEvent.click(manageButton);
    expect(onNavigateMock).toHaveBeenCalledWith('/identity');

    // Trigger navigation from DashboardStats identity card
    const identityStatCardText = screen.getByText('Identity Verification');
    fireEvent.click(identityStatCardText.parentElement!);
    expect(onNavigateMock).toHaveBeenCalledWith('/identity');
  });

  it('renders calendar events correctly', () => {
    const onNavigateMock = vi.fn();
    const state: AppState = {
      ...defaultAppState,
      calendarEvents: [
        { id: 'e1', title: 'Past Event', date: new Date('2024-02-10T12:00:00Z'), type: 'meeting' },
        { id: 'e2', title: 'Current Event', date: new Date('2024-02-15T14:00:00Z'), type: 'deadline' },
        { id: 'e3', title: 'Future Event', date: new Date('2024-02-20T12:00:00Z'), type: 'vote' }
      ]
    };

    render(<Dashboard state={state} onNavigate={onNavigateMock} />);

    expect(screen.getByText('Past Event')).toBeInTheDocument();
    expect(screen.getByText('Current Event')).toBeInTheDocument();
    expect(screen.getByText('Future Event')).toBeInTheDocument();
    expect(screen.getByText('Feb 10')).toBeInTheDocument();
  });

  it('renders ballot options and submissions, and navigates to vote', () => {
    const onNavigateMock = vi.fn();
    const state: AppState = {
      ...defaultAppState,
      ballotOptions: [
        { id: 'o1', title: 'Option 1', description: 'Desc', budget: 1000, isWriteIn: false, category: 'infrastructure' },
        { id: 'o2', title: 'Option 2', description: 'Desc', budget: 2000, isWriteIn: true, category: 'education' }
      ],
      ballotSubmissions: [
        { voterId: 'v1', rankings: [{ optionId: 'o1', rank: 1 }], submittedAt: new Date() },
        { voterId: 'v2', rankings: [{ optionId: 'o1', rank: 1 }], submittedAt: new Date() }
      ]
    };

    render(<Dashboard state={state} onNavigate={onNavigateMock} />);

    // Total budget in ballot: 3000
    expect(screen.getByText('$3,000')).toBeInTheDocument();
    expect(screen.getByText('1 write-in candidates')).toBeInTheDocument();

    // Vote counts
    expect(screen.getByText('2 first-choice votes')).toBeInTheDocument(); // For Option 1
    expect(screen.getByText('0 first-choice votes')).toBeInTheDocument(); // For Option 2

    // 2/4 submissions -> 50%
    // 2 first choice out of 2 submissions -> 100% for Option 1
    expect(screen.getAllByText('100%').length).toBeGreaterThan(0);

    // Navigate to vote
    const viewBallotBtn = screen.getByText('View Ballot');
    fireEvent.click(viewBallotBtn);
    expect(onNavigateMock).toHaveBeenCalledWith('/vote');
  });

  it('renders RCV result if available', () => {
    const onNavigateMock = vi.fn();
    const state: AppState = {
      ...defaultAppState,
      rcvResult: {
        winner: { id: 'o1', title: 'Winning Proposal', description: '', budget: 1000, isWriteIn: false, category: 'infrastructure' },
        rounds: [],
        eliminated: [],
        totalVotes: 10
      }
    };

    render(<Dashboard state={state} onNavigate={onNavigateMock} />);

    expect(screen.getByText('Current Leader')).toBeInTheDocument();
    expect(screen.getByText('Winning Proposal')).toBeInTheDocument();
  });

  it('renders proposals and handles compilation navigation', () => {
    const onNavigateMock = vi.fn();
    const state: AppState = {
      ...defaultAppState,
      proposals: [
        { id: 'p1', title: 'Prop 1', description: 'Desc', authorId: 'a1', status: 'draft', tier: 'Tier 1', budget: 1000, category: 'infrastructure', createdAt: new Date() },
        { id: 'p2', title: 'Prop 2', description: 'Desc', authorId: 'a2', status: 'compiled', tier: 'Tier 2', budget: 2000, category: 'education', createdAt: new Date() }
      ]
    };

    render(<Dashboard state={state} onNavigate={onNavigateMock} />);

    expect(screen.getByText('Prop 1')).toBeInTheDocument();
    expect(screen.getByText('Prop 2')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
    expect(screen.getByText('compiled')).toBeInTheDocument();

    // Navigate to compiler
    const compileBtn = screen.getByText('Compile');
    fireEvent.click(compileBtn);
    expect(onNavigateMock).toHaveBeenCalledWith('/compiler');
  });
});
