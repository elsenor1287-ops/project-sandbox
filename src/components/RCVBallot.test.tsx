import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VotingPage } from './RCVBallot';
import type { BallotOption, TestAccount } from '../types';

describe('RCVBallot (VotingPage)', () => {
  const mockOptions: BallotOption[] = [
    {
      id: 'opt-1',
      title: 'Riverside Park Renovation',
      description: 'Park renovation',
      budget: 2500000,
      category: 'environment',
      voteCount: 0,
      isWriteIn: false,
    },
    {
      id: 'opt-2',
      title: 'Main Street Infrastructure',
      description: 'Road resurfacing',
      budget: 3200000,
      category: 'infrastructure',
      voteCount: 0,
      isWriteIn: false,
    },
  ];

  const mockTestAccounts: TestAccount[] = [
    { id: 'test-1', name: 'Sarah Chen', isBot: true, hasVoted: false, writeIns: [] },
  ];

  it('renders initial state correctly', () => {
    const onSubmitBallot = vi.fn();
    const onRunSimulation = vi.fn();
    const onGenerateMockVotes = vi.fn();
    const onResetVoting = vi.fn();

    render(
      <VotingPage
        ballotOptions={mockOptions}
        submissions={[]}
        testAccounts={mockTestAccounts}
        rcvResult={null}
        onSubmitBallot={onSubmitBallot}
        onRunSimulation={onRunSimulation}
        onGenerateMockVotes={onGenerateMockVotes}
        onResetVoting={onResetVoting}
      />
    );

    expect(screen.getByText('RCV Sandbox')).toBeInTheDocument();
    expect(screen.getByText('Riverside Park Renovation')).toBeInTheDocument();
    expect(screen.getByText('Main Street Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('Submit Ballot')).toBeDisabled();
  });

  it('allows ranking options and submitting', () => {
    const onSubmitBallot = vi.fn();
    const onRunSimulation = vi.fn();
    const onGenerateMockVotes = vi.fn();
    const onResetVoting = vi.fn();

    render(
      <VotingPage
        ballotOptions={mockOptions}
        submissions={[]}
        testAccounts={mockTestAccounts}
        rcvResult={null}
        onSubmitBallot={onSubmitBallot}
        onRunSimulation={onRunSimulation}
        onGenerateMockVotes={onGenerateMockVotes}
        onResetVoting={onResetVoting}
      />
    );

    const parkContainer = screen.getByText('Riverside Park Renovation').closest('.card-elevated') as HTMLElement;
    const parkRank1Btn = within(parkContainer).getByRole('button', { name: '1' });

    fireEvent.click(parkRank1Btn);

    expect(screen.getByText('Submit Ballot')).not.toBeDisabled();

    fireEvent.click(screen.getByText('Submit Ballot'));

    expect(onSubmitBallot).toHaveBeenCalledWith({
      voterId: 'CITIZEN-2024-01337',
      rankings: [{ optionId: 'opt-1', rank: 1 }],
      writeIn: undefined,
    });
  });

  it('allows write-in input', () => {
    const onSubmitBallot = vi.fn();

    render(
      <VotingPage
        ballotOptions={mockOptions}
        submissions={[]}
        testAccounts={mockTestAccounts}
        rcvResult={null}
        onSubmitBallot={onSubmitBallot}
        onRunSimulation={vi.fn()}
        onGenerateMockVotes={vi.fn()}
        onResetVoting={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Add Write-In Candidate'));

    const input = screen.getByPlaceholderText('Enter your write-in candidate name...');
    fireEvent.change(input, { target: { value: 'New Park' } });

    // Rank an option to enable submit
    const parkContainer = screen.getByText('Riverside Park Renovation').closest('.card-elevated') as HTMLElement;
    const parkRank1Btn = within(parkContainer).getByRole('button', { name: '1' });
    fireEvent.click(parkRank1Btn);

    fireEvent.click(screen.getByText('Submit Ballot'));

    expect(onSubmitBallot).toHaveBeenCalledWith({
      voterId: 'CITIZEN-2024-01337',
      rankings: [{ optionId: 'opt-1', rank: 1 }],
      writeIn: 'New Park',
    });
  });
});
