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

  it('handles fractional thresholds correctly (odd number of votes)', () => {
    // 3 voters, threshold = 1.5. 2 votes is > 1.5.
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v2', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v3', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
    ];

    const result = calculateRCVResult(options, submissions);
    expect(result.rounds.length).toBe(1);
    expect(result.rounds[0].winner).toBe('opt1');
    expect(result.winner.id).toBe('opt1');
  });

  it('handles 0 submissions (threshold = 0, maxVotes = 0)', () => {
    const submissions: BallotSubmission[] = [];

    const result = calculateRCVResult(options, submissions);

    // totalVotes = 0, threshold = 0.
    // round 1: maxVotes = 0, threshold = 0. 0 > 0 is false.
    // it will eliminate options until 1 is left.
    expect(result.totalVotes).toBe(0);
    expect(result.winner).toBeDefined();
    expect(result.rounds.length).toBeGreaterThan(0);
    result.rounds.forEach(round => {
      expect(round.threshold).toBe(0);
      expect(round.winner).toBeUndefined();
    });
  });

  it('handles submissions with empty rankings (threshold > 0, maxVotes = 0)', () => {
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [], submittedAt: new Date() },
      { voterId: 'v2', rankings: [], submittedAt: new Date() },
    ];

    const result = calculateRCVResult(options, submissions);

    // totalVotes = 2, threshold = 1.
    // maxVotes = 0 in all rounds.
    expect(result.totalVotes).toBe(2);
    expect(result.winner).toBeDefined();
    expect(result.rounds.length).toBeGreaterThan(0);
    result.rounds.forEach(round => {
      expect(round.threshold).toBe(1);
      expect(round.winner).toBeUndefined();
    });
  });

  it('stops at 10 rounds max to prevent infinite loops', () => {
    // Generate 12 options and 1 vote for each to force 11 eliminations
    const manyOptions: BallotOption[] = Array.from({ length: 12 }, (_, i) => ({
      id: `opt${i}`, title: `Option ${i}`, description: '', budget: 0, category: 'other', voteCount: 0, isWriteIn: false
    }));
    const manySubmissions: BallotSubmission[] = Array.from({ length: 12 }, (_, i) => ({
      voterId: `v${i}`, rankings: [{ optionId: `opt${i}`, rank: 1 }], submittedAt: new Date()
    }));

    const result = calculateRCVResult(manyOptions, manySubmissions);

    // It should stop at exactly 10 rounds due to roundNumber < 10 limit
    expect(result.rounds.length).toBe(10);
    expect(result.winner).toBeDefined();
  });

  it('handles options length === 1 at start', () => {
    const singleOption: BallotOption[] = [
      { id: 'opt1', title: 'Option 1', description: '', budget: 0, category: 'other', voteCount: 0, isWriteIn: false }
    ];
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() }
    ];

    const result = calculateRCVResult(singleOption, submissions);
    expect(result.rounds.length).toBe(0); // While loop doesn't execute
    expect(result.winner).toBeDefined();
    expect(result.winner.id).toBe('opt1');
  });

  it('handles empty options list safely (returns undefined winner which gets type asserted)', () => {
    const emptyOptions: BallotOption[] = [];
    const submissions: BallotSubmission[] = [];

    const result = calculateRCVResult(emptyOptions, submissions);
    expect(result.rounds.length).toBe(0);
    expect(result.winner).toBeUndefined(); // options[0] is undefined
  });

  it('ignores votes for options not present in currentOptions', () => {
    // 2 voters for opt1, 1 voter for non-existent option
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v2', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v3', rankings: [{ optionId: 'opt_non_existent', rank: 1 }], submittedAt: new Date() },
    ];

    const result = calculateRCVResult(options, submissions);
    // Total votes is still 3 (since there are 3 submissions). Threshold is 1.5.
    // opt1 gets 2 votes, which > 1.5.
    expect(result.rounds.length).toBe(1);
    expect(result.winner.id).toBe('opt1');
    expect(result.rounds[0].voteDistribution['opt1']).toBe(2);
    // opt_non_existent shouldn't be in distribution
    expect(result.rounds[0].voteDistribution['opt_non_existent']).toBeUndefined();
  });

  it('declares a winner in a later round when redistributed votes push them over the threshold', () => {
    // 5 voters, threshold is 2.5
    // opt1: 2, opt2: 2, opt3: 1
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v2', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v3', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v4', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
      {
        voterId: 'v5',
        rankings: [
          { optionId: 'opt3', rank: 1 },
          { optionId: 'opt1', rank: 2 } // Vote transfers to opt1
        ],
        submittedAt: new Date()
      },
    ];

    const result = calculateRCVResult(options, submissions);

    expect(result.rounds.length).toBe(2);
    // Round 1: no winner, opt3 eliminated
    expect(result.rounds[0].winner).toBeUndefined();
    expect(result.rounds[0].eliminatedOptionId).toBe('opt3');

    // Round 2: opt1 wins with 3 votes
    expect(result.rounds[1].winner).toBe('opt1');
    expect(result.winner.id).toBe('opt1');
    expect(result.rounds[1].voteDistribution['opt1']).toBe(3);
  });

  it('handles exhausted ballots where redistributed votes do not reach threshold', () => {
    // 5 voters, threshold is 2.5
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v2', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v3', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v4', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
      {
        voterId: 'v5',
        rankings: [
          { optionId: 'opt3', rank: 1 }
          // No second choice, ballot is exhausted
        ],
        submittedAt: new Date()
      },
    ];

    const result = calculateRCVResult(options, submissions);

    // Will run for 2 rounds until 1 option is left, then fallback to last remaining option
    expect(result.rounds.length).toBe(2);
    expect(result.winner).toBeDefined();
    // No one ever reaches > 2.5 votes
    expect(result.rounds[0].winner).toBeUndefined();
    expect(result.rounds[1].winner).toBeUndefined();
  });

  it('declares winner immediately if there is exactly 1 voter', () => {
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
    ];
    const result = calculateRCVResult(options, submissions);

    // Threshold is 0.5. Max votes is 1. 1 > 0.5, so round 1 winner.
    expect(result.rounds.length).toBe(1);
    expect(result.rounds[0].winner).toBe('opt2');
    expect(result.winner.id).toBe('opt2');
  });

  it('does not declare a winner if redistributed votes push a candidate exactly to the threshold', () => {
    // 6 voters, threshold is 3
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v2', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v3', rankings: [{ optionId: 'opt2', rank: 1 }, { optionId: 'opt1', rank: 2 }], submittedAt: new Date() },
      { voterId: 'v4', rankings: [{ optionId: 'opt3', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v5', rankings: [{ optionId: 'opt3', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v6', rankings: [{ optionId: 'opt3', rank: 1 }], submittedAt: new Date() },
    ];

    const result = calculateRCVResult(options, submissions);

    // Round 1: opt3 has 3, opt1 has 2, opt2 has 1. No one > 3. opt2 eliminated.
    // Round 2: opt3 has 3, opt1 has 3. No one > 3.
    expect(result.rounds.length).toBeGreaterThan(1);
    expect(result.rounds[0].winner).toBeUndefined();
    expect(result.rounds[1].winner).toBeUndefined();
    expect(result.rounds[1].voteDistribution['opt1']).toBe(3);
  });

  it('does not bypass threshold even if a candidate has 100% of the active votes due to empty ballots', () => {
    // 4 voters, threshold = 2. Only 1 active vote.
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v2', rankings: [], submittedAt: new Date() },
      { voterId: 'v3', rankings: [], submittedAt: new Date() },
      { voterId: 'v4', rankings: [], submittedAt: new Date() },
    ];

    const result = calculateRCVResult(options, submissions);

    // opt1 gets 1 vote. 1 is not > 2.
    // So opt1 does not win immediately despite having 100% of active votes.
    expect(result.rounds.length).toBeGreaterThan(1);
    expect(result.rounds[0].winner).toBeUndefined();
    expect(result.winner.id).toBe('opt1');
  });
});
