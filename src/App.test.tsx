import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { useAppState } from './hooks/useAppState';

// Mock the components to verify they are rendered
vi.mock('./pages/Dashboard', () => ({
  Dashboard: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

vi.mock('./components/IdentityVerification', () => ({
  IdentityPage: () => <div data-testid="identity-page">Identity Page</div>,
}));

vi.mock('./components/RCVBallot', () => ({
  VotingPage: () => <div data-testid="voting-page">Voting Page</div>,
}));

vi.mock('./components/ProposalCompiler', () => ({
  CompilerPage: () => <div data-testid="compiler-page">Compiler Page</div>,
}));

vi.mock('./components/Layout', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
  Header: () => <div data-testid="header">Header</div>,
}));

// Mock the hook
vi.mock('./hooks/useAppState', () => ({
  useAppState: vi.fn(),
}));

describe('App Routing', () => {
  const mockAppState = {
    state: {
      currentPage: '/dashboard',
      identity: { status: 'active' },
      ballotOptions: [],
      ballotSubmissions: [],
      testAccounts: [],
      rcvResult: null,
      proposals: [],
    },
    setCurrentPage: vi.fn(),
    completeVerificationStep: vi.fn(),
    triggerFraudStrike: vi.fn(),
    freezeAccount: vi.fn(),
    resetIdentity: vi.fn(),
    submitProposal: vi.fn(),
    checkLaw1Violations: vi.fn(),
    submitBallot: vi.fn(),
    runRCVSimulation: vi.fn(),
    generateMockVotes: vi.fn(),
    resetVoting: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Dashboard when route is /dashboard', () => {
    (useAppState as any).mockReturnValue({
      ...mockAppState,
      state: { ...mockAppState.state, currentPage: '/dashboard' },
    });

    render(<App />);

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    expect(screen.queryByTestId('identity-page')).not.toBeInTheDocument();
  });

  it('renders IdentityPage when route is /identity', () => {
    (useAppState as any).mockReturnValue({
      ...mockAppState,
      state: { ...mockAppState.state, currentPage: '/identity' },
    });

    render(<App />);

    expect(screen.getByTestId('identity-page')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
  });

  it('renders VotingPage when route is /vote', () => {
    (useAppState as any).mockReturnValue({
      ...mockAppState,
      state: { ...mockAppState.state, currentPage: '/vote' },
    });

    render(<App />);

    expect(screen.getByTestId('voting-page')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
  });

  it('renders CompilerPage when route is /compiler', () => {
    (useAppState as any).mockReturnValue({
      ...mockAppState,
      state: { ...mockAppState.state, currentPage: '/compiler' },
    });

    render(<App />);

    expect(screen.getByTestId('compiler-page')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
  });

  it('renders Dashboard as default fallback for unknown routes', () => {
    (useAppState as any).mockReturnValue({
      ...mockAppState,
      state: { ...mockAppState.state, currentPage: '/unknown-route-123' },
    });

    render(<App />);

    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    expect(screen.queryByTestId('identity-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('voting-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('compiler-page')).not.toBeInTheDocument();
  });
});
