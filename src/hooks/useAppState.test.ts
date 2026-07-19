import { renderHook, act } from '@testing-library/react';
import { useAppState, calculateRCVResult } from './useAppState';
import { describe, it, expect } from 'vitest';
import { BallotOption, BallotSubmission, Proposal } from '../types';

describe('useAppState', () => {
  describe('submitBallot', () => {
    it('should add a ballot submission and create a new write-in option if it does not exist', () => {
      const { result } = renderHook(() => useAppState());
      const newSubmission = { voterId: 'voter-1', rankings: [{ optionId: 'opt-1', rank: 1 }], writeIn: 'John Doe' };
      act(() => { result.current.submitBallot(newSubmission); });
      expect(result.current.state.ballotSubmissions).toHaveLength(1);
      expect(result.current.state.ballotSubmissions[0].voterId).toBe('voter-1');
      expect(result.current.state.ballotSubmissions[0].writeIn).toBe('John Doe');

      const writeInOption = result.current.state.ballotOptions.find(
        (opt) => opt.title === 'John Doe' && opt.isWriteIn
      );

      expect(writeInOption).toBeDefined();
      expect(writeInOption?.writeInCount).toBe(1);
    });

    it('should add a ballot submission and increment the count of an existing write-in option', () => {
      const { result } = renderHook(() => useAppState());

      const submission1 = {
        voterId: 'voter-1',
        rankings: [],
        writeIn: 'Jane Doe',
      };

      const submission2 = {
        voterId: 'voter-2',
        rankings: [],
        writeIn: 'jane doe',
      };

      act(() => {
        result.current.submitBallot(submission1);
        result.current.submitBallot(submission2);
      });
      expect(result.current.state.ballotSubmissions).toHaveLength(2);

      const writeInOptions = result.current.state.ballotOptions.filter(
        (opt) => opt.title.toLowerCase() === 'jane doe' && opt.isWriteIn
      );

      expect(writeInOptions).toHaveLength(1);
      expect(writeInOptions[0].writeInCount).toBe(2);
    });

    it('should add a ballot submission without a write-in', () => {
      const { result } = renderHook(() => useAppState());
      const initialOptionsCount = result.current.state.ballotOptions.length;
      const submission = { voterId: 'voter-1', rankings: [{ optionId: 'opt-1', rank: 1 }] };
      act(() => { result.current.submitBallot(submission); });
      expect(result.current.state.ballotSubmissions).toHaveLength(1);
      expect(result.current.state.ballotSubmissions[0].voterId).toBe('voter-1');
      expect(result.current.state.ballotSubmissions[0].writeIn).toBeUndefined();

      expect(result.current.state.ballotOptions).toHaveLength(initialOptionsCount);
    });
  });

  describe('submitProposal', () => {
    it('compiles a valid proposal without any Law 1 violation keywords', () => {
      const { result } = renderHook(() => useAppState());

      let newProposal: Proposal | undefined;
      act(() => {
        newProposal = result.current.submitProposal({
          title: 'Test Proposal',
          content: 'This is a safe proposal that just suggests building a park.',
          tier: 'law1_shield',
          submittedBy: 'user-1',
        });
      });

      expect(newProposal?.status).toBe('compiled');
      expect(newProposal?.vetoReason).toBeUndefined();
      expect(newProposal?.triggeredKeywords).toBeUndefined();
    });

    it('vetoes a proposal with a single Law 1 violation keyword', () => {
      const { result } = renderHook(() => useAppState());

      let newProposal: Proposal | undefined;
      act(() => {
        newProposal = result.current.submitProposal({
          title: 'Bad Proposal',
          content: 'This proposal will ban speech in public areas.',
          tier: 'law1_shield',
          submittedBy: 'user-1',
        });
      });

      const stateProposal = result.current.state.proposals.find(p => p.id === newProposal?.id);
      expect(stateProposal?.status).toBe('vetoed');
      expect(newProposal?.status).toBe('vetoed');
    });

    it('vetoes a proposal with a case-insensitive Law 1 violation keyword', () => {
      const { result } = renderHook(() => useAppState());

      let newProposal: Proposal | undefined;
      act(() => {
        newProposal = result.current.submitProposal({
          title: 'Casing Proposal',
          content: 'We need to CENSOR the media right now.',
          tier: 'law1_shield',
          submittedBy: 'user-1',
        });
      });

      expect(newProposal?.status).toBe('vetoed');
      expect(newProposal?.vetoReason).toBe('First Amendment Shield: "censor" detected');
      expect(newProposal?.triggeredKeywords).toEqual(['First Amendment Shield: "censor" detected']);
    });
  });
});



describe('calculateRCVResult', () => {
  const options: BallotOption[] = [
    { id: 'opt1', title: 'Option 1', description: '', budget: 0, category: 'other', voteCount: 0, isWriteIn: false },
    { id: 'opt2', title: 'Option 2', description: '', budget: 0, category: 'other', voteCount: 0, isWriteIn: false },
    { id: 'opt3', title: 'Option 3', description: '', budget: 0, category: 'other', voteCount: 0, isWriteIn: false },
  ];

  it('should find winner in round 1 if they have majority', () => {
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v2', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v3', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
    ];
    const result = calculateRCVResult(options, submissions);
    expect(result.winner.id).toBe('opt1');
    expect(result.rounds.length).toBe(1);
  });
});

describe('useAppState Law1', () => {
  describe('checkLaw1Violations', () => {
    it('returns empty array when there are no violations', () => {
      const { result } = renderHook(() => useAppState());
      const violations = result.current.checkLaw1Violations('We should build a new park in the community.');
      expect(violations).toEqual([]);
    });

    it('detects a single violation', () => {
      const { result } = renderHook(() => useAppState());
      const violations = result.current.checkLaw1Violations('The city will ban speech on weekends.');
      expect(violations).toEqual(['First Amendment Shield: "ban speech" detected']);
    });

    it('detects violations ignoring case (case insensitivity)', () => {
      const { result } = renderHook(() => useAppState());
      const violations = result.current.checkLaw1Violations('We should BAn SPeeCh immediately.');
      expect(violations).toEqual(['First Amendment Shield: "ban speech" detected']);
    });

    it('detects multiple violations', () => {
      const { result } = renderHook(() => useAppState());
      const violations = result.current.checkLaw1Violations('We will ban speech and confiscate guns from citizens.');
      expect(violations).toContain('First Amendment Shield: "ban speech" detected');
      expect(violations).toContain('Second Amendment Shield: "confiscate guns" detected');
      expect(violations.length).toBe(2);
    });

    it('detects partial/sub-string matches correctly', () => {
      const { result } = renderHook(() => useAppState());
      const violations = result.current.checkLaw1Violations('If they implement a censorship board...');
      expect(violations).toEqual(['First Amendment Shield: "censor" detected']);
    });
  });
});

describe('calculateRCVResult', () => {
  const options: BallotOption[] = [
    { id: 'opt1', title: 'Option 1', description: '', budget: 0, category: 'other', voteCount: 0, isWriteIn: false },
    { id: 'opt2', title: 'Option 2', description: '', budget: 0, category: 'other', voteCount: 0, isWriteIn: false },
    { id: 'opt3', title: 'Option 3', description: '', budget: 0, category: 'other', voteCount: 0, isWriteIn: false },
  ];

  it('should run multiple rounds and eliminate lowest vote getter if no majority', () => {
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }, { optionId: 'opt2', rank: 2 }], submittedAt: new Date() },
      { voterId: 'v2', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v3', rankings: [{ optionId: 'opt2', rank: 1 }, { optionId: 'opt1', rank: 2 }], submittedAt: new Date() },
      { voterId: 'v4', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v5', rankings: [{ optionId: 'opt3', rank: 1 }, { optionId: 'opt1', rank: 2 }], submittedAt: new Date() },
    ];

    const result = calculateRCVResult(options, submissions);
    expect(result.winner.id).toBe('opt1');
    expect(result.rounds.length).toBe(2);
    expect(result.rounds[0].eliminatedOptionId).toBe('opt3');
    expect(result.rounds[1].winner).toBe('opt1');
    expect(result.rounds[1].voteDistribution).toEqual({ opt1: 3, opt2: 2 });
  });

  it('should handle ties for minimum votes during elimination', () => {
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

    const result = calculateRCVResult(tieOptions, tieSubmissions);
    expect(result.rounds.length).toBeGreaterThan(1);
    expect(result.winner).toBeDefined();
  });

  it('should handle exact tie terminal condition where loop finishes without a winner', () => {
    const tieSubmissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v2', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
    ];

    const currentOptions = [options[0], options[1]];

    const result = calculateRCVResult(currentOptions, tieSubmissions);

    expect(result.winner).toBeDefined();
    expect(['opt1', 'opt2']).toContain(result.winner.id);
  });

  it('should handle empty submissions', () => {
    const result = calculateRCVResult(options, []);

    expect(result.winner.id).toBe('opt3');
    expect(result.rounds.length).toBe(2);
    expect(result.totalVotes).toBe(0);
  });

  it('should handle exhausted ballots where no one reaches majority', () => {
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v2', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v3', rankings: [{ optionId: 'opt3', rank: 1 }], submittedAt: new Date() },
    ];

    const result = calculateRCVResult(options, submissions);
    expect(result.winner).toBeDefined();
  });
});

describe('useAppState Law1', () => {
  describe('checkLaw1Violations', () => {
    it('returns empty array when there are no violations', () => {
      const { result } = renderHook(() => useAppState());
      const violations = result.current.checkLaw1Violations('We should build a new park in the community.');
      expect(violations).toEqual([]);
    });

    it('detects a single violation', () => {
      const { result } = renderHook(() => useAppState());
      const violations = result.current.checkLaw1Violations('The city will ban speech on weekends.');
      expect(violations).toEqual(['First Amendment Shield: "ban speech" detected']);
    });

    it('detects violations ignoring case (case insensitivity)', () => {
      const { result } = renderHook(() => useAppState());
      const violations = result.current.checkLaw1Violations('We should BAn SPeeCh immediately.');
      expect(violations).toEqual(['First Amendment Shield: "ban speech" detected']);
    });

    it('detects multiple violations', () => {
      const { result } = renderHook(() => useAppState());
      const violations = result.current.checkLaw1Violations('We will ban speech and confiscate guns from citizens.');
      expect(violations).toContain('First Amendment Shield: "ban speech" detected');
      expect(violations).toContain('Second Amendment Shield: "confiscate guns" detected');
      expect(violations.length).toBe(2);
    });

    it('detects partial/sub-string matches correctly', () => {
      const { result } = renderHook(() => useAppState());
      const violations = result.current.checkLaw1Violations('If they implement a censorship board...');
      expect(violations).toEqual(['First Amendment Shield: "censor" detected']);
    });
  });
});
