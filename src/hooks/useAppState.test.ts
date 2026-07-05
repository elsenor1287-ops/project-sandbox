import { describe, it, expect } from 'vitest';
import { calculateRCVResult } from './useAppState';
import { BallotOption, BallotSubmission } from '../types';

describe('calculateRCVResult', () => {
  const options: BallotOption[] = [
    { id: 'opt1', title: 'Option 1', description: '', budget: 0, category: 'other', voteCount: 0, isWriteIn: false },
    { id: 'opt2', title: 'Option 2', description: '', budget: 0, category: 'other', voteCount: 0, isWriteIn: false },
    { id: 'opt3', title: 'Option 3', description: '', budget: 0, category: 'other', voteCount: 0, isWriteIn: false },
  ];

  it('should declare a winner in the first round if an option has a majority', () => {
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v2', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v3', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
    ];

    const result = calculateRCVResult(options, submissions);

    expect(result.winner.id).toBe('opt1');
    expect(result.rounds.length).toBe(1);
    expect(result.totalVotes).toBe(3);
    expect(result.rounds[0].winner).toBe('opt1');
    expect(result.rounds[0].voteDistribution).toEqual({ opt1: 2, opt2: 1, opt3: 0 });
  });

  it('should run multiple rounds and eliminate lowest vote getter if no majority', () => {
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }, { optionId: 'opt2', rank: 2 }], submittedAt: new Date() },
      { voterId: 'v2', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v3', rankings: [{ optionId: 'opt2', rank: 1 }, { optionId: 'opt1', rank: 2 }], submittedAt: new Date() },
      { voterId: 'v4', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v5', rankings: [{ optionId: 'opt3', rank: 1 }, { optionId: 'opt1', rank: 2 }], submittedAt: new Date() }, // opt3 eliminated, vote goes to opt1
    ];

    // Initial distribution: opt1: 2, opt2: 2, opt3: 1
    // Round 1: opt3 eliminated
    // Round 2: opt3 vote goes to opt1. Distribution: opt1: 3, opt2: 2. Winner: opt1.
    const result = calculateRCVResult(options, submissions);

    expect(result.winner.id).toBe('opt1');
    expect(result.rounds.length).toBe(2);
    expect(result.rounds[0].eliminatedOptionId).toBe('opt3');
    expect(result.rounds[1].winner).toBe('opt1');
    expect(result.rounds[1].voteDistribution).toEqual({ opt1: 3, opt2: 2 });
  });

  it('should handle ties for minimum votes during elimination', () => {
    // Total 3 votes. Threshold 1.5. opt1 has 2 votes. It wins round 1.
    // Let's create a real tie scenario where elimination must happen.
    const tieOptions: BallotOption[] = [
      ...options,
      { id: 'opt4', title: 'Option 4', description: '', budget: 0, category: 'other', voteCount: 0, isWriteIn: false },
    ];

    const tieSubmissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v2', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v3', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v4', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v5', rankings: [{ optionId: 'opt3', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v6', rankings: [{ optionId: 'opt4', rank: 1 }], submittedAt: new Date() },
    ];

    // Initial: opt1: 2, opt2: 2, opt3: 1, opt4: 1. Total: 6. Threshold: 3.
    // Tied minimums: opt3 and opt4. The algorithm will pick one (usually the first one found by Object.keys).
    const result = calculateRCVResult(tieOptions, tieSubmissions);

    expect(result.rounds.length).toBeGreaterThan(1);
    expect(result.winner).toBeDefined();
  });

  it('should handle empty submissions', () => {
    const result = calculateRCVResult(options, []);

    // If no submissions, all options tie with 0 votes.
    // The algorithm eliminates them in order of Object.keys until 1 is left.
    // In this case, opt1 is eliminated, then opt2, leaving opt3.
    expect(result.winner.id).toBe('opt3');
    expect(result.rounds.length).toBe(2);
    expect(result.totalVotes).toBe(0);
  });

  it('should handle exhausted ballots where no one reaches majority', () => {
    // If ballots don't have second choices, votes might be exhausted.
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v2', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v3', rankings: [{ optionId: 'opt3', rank: 1 }], submittedAt: new Date() },
    ];

    // Initial: opt1: 1, opt2: 1, opt3: 1.
    // It should eliminate options until one remains or majority is reached.
    const result = calculateRCVResult(options, submissions);
    expect(result.winner).toBeDefined();
  });
});
