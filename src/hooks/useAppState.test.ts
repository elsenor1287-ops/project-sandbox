import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAppState, calculateRCVResult } from './useAppState';
import { BallotOption, BallotSubmission } from '../types';

describe('useAppState', () => {
  describe('identity verification', () => {
    it('should complete passport step', () => {
      const { result } = renderHook(() => useAppState());
      act(() => {
        result.current.completeVerificationStep('passport');
      });
      expect(result.current.state.identity.passportVerified).toBe(true);
      expect(result.current.state.identity.verificationStep).toBe('utility');
    });

    it('should complete utility step', () => {
      const { result } = renderHook(() => useAppState());
      act(() => {
        result.current.completeVerificationStep('utility');
      });
      expect(result.current.state.identity.utilityVerified).toBe(true);
      expect(result.current.state.identity.verificationStep).toBe('vouching');
    });

    it('should add vouch tokens and complete verification when reaching 3', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.addVouchToken({
          id: 't-1',
          neighborName: 'Alice',
          neighborAddress: '123 St',
          signedAt: new Date(),
          isValid: true,
        });
        result.current.addVouchToken({
          id: 't-2',
          neighborName: 'Bob',
          neighborAddress: '456 St',
          signedAt: new Date(),
          isValid: true,
        });
        result.current.addVouchToken({
          id: 't-3',
          neighborName: 'Charlie',
          neighborAddress: '789 St',
          signedAt: new Date(),
          isValid: true,
        });
      });

      expect(result.current.state.identity.vouchTokens).toHaveLength(3);
      expect(result.current.state.identity.verificationStep).toBe('complete');
      expect(result.current.state.identity.status).toBe('active');
    });

    it('should keep status active and complete when length > 3', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.addVouchToken({ id: 't-1', neighborName: 'Alice', neighborAddress: '123 St', signedAt: new Date(), isValid: true });
        result.current.addVouchToken({ id: 't-2', neighborName: 'Bob', neighborAddress: '456 St', signedAt: new Date(), isValid: true });
        result.current.addVouchToken({ id: 't-3', neighborName: 'Charlie', neighborAddress: '789 St', signedAt: new Date(), isValid: true });
        result.current.addVouchToken({ id: 't-4', neighborName: 'Dave', neighborAddress: '101 St', signedAt: new Date(), isValid: true });
      });

      expect(result.current.state.identity.vouchTokens).toHaveLength(4);
      expect(result.current.state.identity.verificationStep).toBe('complete');
      expect(result.current.state.identity.status).toBe('active');
    });
  });

  describe('submitBallot', () => {
    it('should add a ballot submission and create a new write-in option if it does not exist', () => {
      const { result } = renderHook(() => useAppState());

      const newSubmission = {
        voterId: 'voter-1',
        rankings: [{ optionId: 'opt-1', rank: 1 }],
        writeIn: 'John Doe',
      };

      act(() => {
        result.current.submitBallot(newSubmission);
      });

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

      const submission = {
        voterId: 'voter-1',
        rankings: [{ optionId: 'opt-1', rank: 1 }],
      };

      act(() => {
        result.current.submitBallot(submission);
      });

      expect(result.current.state.ballotSubmissions).toHaveLength(1);
      expect(result.current.state.ballotSubmissions[0].voterId).toBe('voter-1');
      expect(result.current.state.ballotSubmissions[0].writeIn).toBeUndefined();

      expect(result.current.state.ballotOptions).toHaveLength(initialOptionsCount);
    });
  });

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

  describe('submitProposal', () => {
    it('compiles a valid proposal without any Law 1 violation keywords', () => {
      const { result } = renderHook(() => useAppState());

      let newProposal: ReturnType<typeof result.current.submitProposal> | undefined;
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

    it('vetoes a proposal with Law 1 violations', () => {
      const { result } = renderHook(() => useAppState());

      let newProposal: ReturnType<typeof result.current.submitProposal> | undefined;
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
    });

    it('vetoes with case insensitivity', () => {
      const { result } = renderHook(() => useAppState());

      let newProposal: ReturnType<typeof result.current.submitProposal> | undefined;
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

  it('should run multiple rounds and eliminate lowest vote getter if no majority', () => {
    const submissions: BallotSubmission[] = [
      { voterId: 'v1', rankings: [{ optionId: 'opt1', rank: 1 }, { optionId: 'opt2', rank: 2 }], submittedAt: new Date() },
      { voterId: 'v2', rankings: [{ optionId: 'opt1', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v3', rankings: [{ optionId: 'opt2', rank: 1 }, { optionId: 'opt1', rank: 2 }], submittedAt: new Date() },
      { voterId: 'v4', rankings: [{ optionId: 'opt2', rank: 1 }], submittedAt: new Date() },
      { voterId: 'v5', rankings: [{ optionId: 'opt3', rank: 1 }, { optionId: 'opt1', rank: 2 }], submittedAt: new Date() },
    ];

    const result = calculateRCVResult(options, submissions);
    // opt3 is eliminated first
    expect(result.rounds.length).toBe(2);
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
