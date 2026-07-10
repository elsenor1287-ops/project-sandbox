import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardStats } from './DashboardStats';
import type { AppState } from '../../types';

describe('DashboardStats', () => {
  const defaultProps = {
    identity: {
      citizenId: '123',
      status: 'active',
      verificationStep: 'complete',
      passportVerified: true,
      utilityVerified: true,
      vouchTokens: [],
      fraudStrikes: 0,
      isVouchingFor: [],
      createdAt: new Date(),
    } as AppState['identity'],
    ballotSubmissions: [
      { voterId: 'v1', rankings: [], submittedAt: new Date() },
      { voterId: 'v2', rankings: [], submittedAt: new Date() }
    ] as AppState['ballotSubmissions'],
    proposals: [
      { id: 'p1', title: 'Prop 1', content: '...', tier: 'law2_sandbox', submittedBy: '1', submittedAt: new Date(), status: 'draft' }
    ] as AppState['proposals'],
    ballotOptions: [
      { id: 'o1', title: 'Opt 1', description: 'desc', budget: 1000, category: 'other', voteCount: 0, isWriteIn: false },
      { id: 'o2', title: 'Opt 2', description: 'desc', budget: 2000, category: 'other', voteCount: 0, isWriteIn: true },
      { id: 'o3', title: 'Opt 3', description: 'desc', budget: 1000, category: 'other', voteCount: 0, isWriteIn: true }
    ] as AppState['ballotOptions'],
    daysRemaining: 15,
    participationRate: '45.5',
    onNavigate: vi.fn(),
  };

  it('renders all stat cards with correct data', () => {
    render(<DashboardStats {...defaultProps} />);

    // Identity Verification card
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Identity Verification')).toBeInTheDocument();
    expect(screen.getByText('No fraud warnings')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();

    // Votes Cast card
    expect(screen.getByText('Votes Cast')).toBeInTheDocument();
    expect(screen.getByText('45.5% participation rate')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();

    // Active Ballot Options card
    expect(screen.getByText('3')).toBeInTheDocument(); // Number of options
    expect(screen.getByText('1')).toBeInTheDocument(); // Number of proposals
    expect(screen.getByText('Active Ballot Options')).toBeInTheDocument();
    expect(screen.getByText('2 write-in candidates')).toBeInTheDocument();

    // Both Votes Cast and Active Ballot Options share this value or unique ones
    // We changed the options to 3, so votes cast is 2, active options is 3
    expect(screen.getByText('2')).toBeInTheDocument(); // Number of votes cast

    // Budget / Days Remaining card
    expect(screen.getByText('$4,000')).toBeInTheDocument();
    expect(screen.getByText('Total Budget in Ballot')).toBeInTheDocument();
    expect(screen.getByText('15d left')).toBeInTheDocument();
  });

  it('renders correctly when identity is frozen and has fraud strikes', () => {
    const props = {
      ...defaultProps,
      identity: {
        ...defaultProps.identity,
        status: 'frozen' as const,
        fraudStrikes: 2,
      },
    };

    render(<DashboardStats {...props} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('frozen')).toBeInTheDocument();
    expect(screen.getByText('2 fraud strikes')).toBeInTheDocument();
  });

  it('calls onNavigate when clicking on the identity stat card', () => {
    const onNavigateMock = vi.fn();
    const props = {
      ...defaultProps,
      onNavigate: onNavigateMock,
    };

    render(<DashboardStats {...props} />);

    const identityCard = screen.getByText('Identity Verification').closest('.stat-card');
    expect(identityCard).toBeInTheDocument();

    fireEvent.click(identityCard!);

    expect(onNavigateMock).toHaveBeenCalledTimes(1);
    expect(onNavigateMock).toHaveBeenCalledWith('/identity');
  });
});
