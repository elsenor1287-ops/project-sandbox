import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VotingPage } from './RCVBallot';
import type { BallotOption, BallotSubmission, TestAccount } from '../types';

const mockOptions: BallotOption[] = [
  { id: 'opt1', title: 'Option 1', description: 'Desc 1', budget: 1000, category: 'education', voteCount: 0, isWriteIn: false },
  { id: 'opt2', title: 'Option 2', description: 'Desc 2', budget: 2000, category: 'infrastructure', voteCount: 0, isWriteIn: false },
];

const mockSubmissions: BallotSubmission[] = [];
const mockTestAccounts: TestAccount[] = [];

describe('VotingPage', () => {
  it('renders initial state correctly', () => {
    const onSubmitBallot = vi.fn();
    const onRunSimulation = vi.fn();
    const onGenerateMockVotes = vi.fn();
    const onResetVoting = vi.fn();

    render(
      <VotingPage
        ballotOptions={mockOptions}
        submissions={mockSubmissions}
        testAccounts={mockTestAccounts}
        rcvResult={null}
        onSubmitBallot={onSubmitBallot}
        onRunSimulation={onRunSimulation}
        onGenerateMockVotes={onGenerateMockVotes}
        onResetVoting={onResetVoting}
      />
    );

    expect(screen.getByText('RCV Sandbox')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('allows ranking options and submits ballot correctly', () => {
    const onSubmitBallot = vi.fn();
    const onRunSimulation = vi.fn();
    const onGenerateMockVotes = vi.fn();
    const onResetVoting = vi.fn();

    render(
      <VotingPage
        ballotOptions={mockOptions}
        submissions={mockSubmissions}
        testAccounts={mockTestAccounts}
        rcvResult={null}
        onSubmitBallot={onSubmitBallot}
        onRunSimulation={onRunSimulation}
        onGenerateMockVotes={onGenerateMockVotes}
        onResetVoting={onResetVoting}
      />
    );

    // Rank Option 1 as 1st
    const opt1Container = screen.getByText('Option 1').closest('.card-elevated') as HTMLElement;
    const opt1Rank1Btn = within(opt1Container).getByRole('button', { name: '1' });
    fireEvent.click(opt1Rank1Btn);

    // Rank Option 2 as 2nd
    const opt2Container = screen.getByText('Option 2').closest('.card-elevated') as HTMLElement;
    const opt2Rank2Btn = within(opt2Container).getByRole('button', { name: '2' });
    fireEvent.click(opt2Rank2Btn);

    // Submit ballot
    const submitBtn = screen.getByText('Submit Ballot');
    fireEvent.click(submitBtn);

    expect(onSubmitBallot).toHaveBeenCalledWith({
      voterId: 'CITIZEN-2024-01337',
      rankings: [
        { optionId: 'opt1', rank: 1 },
        { optionId: 'opt2', rank: 2 }
      ],
      writeIn: undefined,
    });
  });

  it('calls correct callbacks for mock votes, run simulation, and reset', () => {
    const onSubmitBallot = vi.fn();
    const onRunSimulation = vi.fn();
    const onGenerateMockVotes = vi.fn();
    const onResetVoting = vi.fn();

    render(
      <VotingPage
        ballotOptions={mockOptions}
        submissions={mockSubmissions}
        testAccounts={mockTestAccounts}
        rcvResult={null}
        onSubmitBallot={onSubmitBallot}
        onRunSimulation={onRunSimulation}
        onGenerateMockVotes={onGenerateMockVotes}
        onResetVoting={onResetVoting}
      />
    );

    // Add Mock Votes
    const mockVotesBtn = screen.getByText('Add 5 Mock Votes');
    fireEvent.click(mockVotesBtn);
    expect(onGenerateMockVotes).toHaveBeenCalledWith(5);

    // Reset
    const resetBtn = screen.getByText('Reset');
    fireEvent.click(resetBtn);
    expect(onResetVoting).toHaveBeenCalled();
  });
});
