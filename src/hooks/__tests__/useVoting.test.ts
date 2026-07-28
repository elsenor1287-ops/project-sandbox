import { calculateRCVResult } from '../useVoting';
import type { BallotOption, BallotSubmission } from '../../types';

describe('calculateRCVResult threshold logic', () => {
  const options: BallotOption[] = [
    { id: 'opt1', title: 'Option 1', description: '', budget: 0, category: 'other', voteCount: 0, isWriteIn: false },
    { id: 'opt2', title: 'Option 2', description: '', budget: 0, category: 'other', voteCount: 0, isWriteIn: false },
    { id: 'opt3', title: 'Option 3', description: '', budget: 0, category: 'other', voteCount: 0, isWriteIn: false },
  ];

  it('does not declare a winner if the max votes exactly meets the threshold', () => {
    // Threshold is 50%. With 4 voters, threshold is 2.
    // Give opt1 2 votes (exactly threshold), opt2 2 votes.
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v2', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v3', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v4', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
    ];

    const result = calculateRCVResult(options, submissions);

    // In this exact tie case, it should go to fallback and pick the first remaining option.
    // It should take more than 1 round since round 1 has no clear winner > 2.
    expect(result.rounds.length).toBeGreaterThan(0);
    // At the end, a winner must be chosen (usually the fallback or through tie breaking).
    expect(result.winner).toBeDefined();
    // It didn't win on round 1.
    expect(result.rounds[0].winner).toBeUndefined();
  });

  it('declares a winner if the max votes strictly exceeds the threshold', () => {
    // Threshold is 50%. With 4 voters, threshold is 2.
    // Give opt1 3 votes, opt2 1 vote.
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v2', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v3', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v4', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
    ];

    const result = calculateRCVResult(options, submissions);

    // Winner should be decided in round 1 since 3 > 2.
    expect(result.rounds.length).toBe(1);
    expect(result.rounds[0].winner).toBe('opt1');
    expect(result.winner.id).toBe('opt1');
  });

  it('handles fallback when no one exceeds the threshold and options run out (tie)', () => {
    // Give everyone 1 vote. Threshold is 3 * 0.5 = 1.5.
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v2', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v3', rankings: [{ optionId: 'opt3', rank: 1 }], submittedAt: new Date() },
    ];

    const result = calculateRCVResult(options, submissions);

    // It should iterate, eliminating until 1 option is left.
    expect(result.winner).toBeDefined();
    expect(['opt1', 'opt2', 'opt3']).toContain(result.winner.id);
  });
});
