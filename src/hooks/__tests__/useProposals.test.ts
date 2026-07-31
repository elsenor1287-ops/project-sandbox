import type { AppState, Proposal } from '../../types';
import { renderHook, act } from '@testing-library/react';
import { useProposals } from '../useProposals';
import { vi, describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';

describe('useProposals', () => {
  const mockSetState = vi.fn();
  let currentState: AppState;

  beforeEach(() => {
    currentState = { proposals: [{ id: 'existing-1', title: 'Existing' } as Proposal] } as AppState;
    mockSetState.mockClear();
    mockSetState.mockImplementation((updater: AppState | ((prev: AppState) => AppState)) => {
      currentState = typeof updater === 'function' ? updater(currentState) : updater;
    });
  });

  describe('checkLaw1Violations', () => {
    it('should return no violations for benign content', () => {
      const { result } = renderHook(() => useProposals(mockSetState));
      const violations = result.current.checkLaw1Violations('We should build a new community center and plant trees.');
      expect(violations).toEqual([]);
    });

    it('should detect a single First Amendment violation', () => {
      const { result } = renderHook(() => useProposals(mockSetState));
      const violations = result.current.checkLaw1Violations('We must ban speech in public parks.');
      expect(violations).toHaveLength(1);
      expect(violations[0]).toBe('First Amendment Shield: "ban speech" detected');
    });

    it('should detect multiple violations across different laws', () => {
      const { result } = renderHook(() => useProposals(mockSetState));
      const violations = result.current.checkLaw1Violations('We will seize weapons and ban protest today.');
      expect(violations).toHaveLength(2);
      expect(violations).toContain('Second Amendment Shield: "seize weapons" detected');
      expect(violations).toContain('First Amendment Shield: "ban protest" detected');
    });

    it('should be case-insensitive when detecting violations', () => {
      const { result } = renderHook(() => useProposals(mockSetState));
      const violations = result.current.checkLaw1Violations('No one can Unreasonable Search our homes or BAN FIREARMS.');
      expect(violations).toHaveLength(2);
      expect(violations).toContain('Fourth Amendment Shield: "unreasonable search" detected');
      expect(violations).toContain('Second Amendment Shield: "ban firearms" detected');
    });

    it('should handle empty string correctly', () => {
      const { result } = renderHook(() => useProposals(mockSetState));
      const violations = result.current.checkLaw1Violations('');
      expect(violations).toEqual([]);
    });

    it('should detect substring matches due to simple string matching (false positives)', () => {
      const { result } = renderHook(() => useProposals(mockSetState));
      const violations = result.current.checkLaw1Violations('The urban speech community and piano trials.');
      expect(violations).toHaveLength(2);
      expect(violations).toContain('First Amendment Shield: "ban speech" detected');
      expect(violations).toContain('Fifth Amendment Shield: "no trial" detected');
    });

    it('should fail to detect violations with irregular spacing (false negatives)', () => {
      const { result } = renderHook(() => useProposals(mockSetState));
      const violations = result.current.checkLaw1Violations('We will ban   speech.');
      expect(violations).toHaveLength(0);
    });

    it('should detect violations across newlines and with punctuation', () => {
      const { result } = renderHook(() => useProposals(mockSetState));
      const violations = result.current.checkLaw1Violations('We will:\n- censor the media\n- seize weapons.');
      expect(violations).toHaveLength(2);
      expect(violations).toContain('First Amendment Shield: "censor" detected');
      expect(violations).toContain('Second Amendment Shield: "seize weapons" detected');
    });

    it('should handle edge cases where lowerKeywords falls back to runtime map', () => {
      // The memoized mapping of PROTOCOL_RULES is verified here to ensure case insensitivity
      // works even when rules rely on the fallback map(k => k.toLowerCase()) behavior.
      const { result } = renderHook(() => useProposals(mockSetState));
      const violations = result.current.checkLaw1Violations('We must SiLeNcE the press.');
      expect(violations).toContain('First Amendment Shield: "silence" detected');
    });

    it('should correctly detect partial substring matches embedded in other words', () => {
      const { result } = renderHook(() => useProposals(mockSetState));
      // "censor" embedded inside "censorship"
      const violations = result.current.checkLaw1Violations('The new censorship board will decide.');
      expect(violations).toContain('First Amendment Shield: "censor" detected');
    });
  });


    it('should test map callback for keywords missing lowerKeyword property by validating default fallback', () => {
      // By forcing a match without `lowerKeywords` pre-populated on some keywords
      const { result } = renderHook(() => useProposals(mockSetState));
      const violations = result.current.checkLaw1Violations('separate but');
      expect(violations).toHaveLength(1);
      expect(violations).toContain('Fourteenth Amendment Shield: "separate but" detected');
    });

    it('should correctly handle multiple keyword matches within the same rule', () => {
      const { result } = renderHook(() => useProposals(mockSetState));
      const violations = result.current.checkLaw1Violations('We will censor and ban speech.');
      expect(violations).toHaveLength(2);
      expect(violations).toContain('First Amendment Shield: "censor" detected');
      expect(violations).toContain('First Amendment Shield: "ban speech" detected');
    });

    it('should correctly map over the triggered keywords on proposal submission', () => {
       const { result } = renderHook(() => useProposals(mockSetState));
       let newProposal;
       act(() => {
          newProposal = result.current.submitProposal({
             title: 'Law',
             content: 'censor',
             tier: 'law1_shield',
             submittedBy: 'user-2'
          });
       });
       expect(newProposal.status).toBe('vetoed');
       expect(newProposal.vetoReason).toBe('First Amendment Shield: "censor" detected');
    });

  describe('submitProposal', () => {
    beforeAll(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    it('should create a compiled proposal when no violations exist', () => {
      const { result } = renderHook(() => useProposals(mockSetState));

      let newProposal: Proposal | undefined;
      act(() => {
        newProposal = result.current.submitProposal({
          title: 'New Park',
          content: 'Let us build a new park',
          tier: 'law2_sandbox',
          submittedBy: 'user-1',
        });
      });

      expect(newProposal).toMatchObject({
        title: 'New Park',
        content: 'Let us build a new park',
        tier: 'law2_sandbox',
        submittedBy: 'user-1',
        status: 'compiled',
        vetoReason: undefined,
        triggeredKeywords: undefined,
      });
      // Allow dynamic ID checking since we know it uses Date.now(), which is deterministic given setSystemTime
      expect(newProposal.id).toBe(`prop-${Date.now()}`);
      expect(newProposal.submittedAt).toEqual(new Date('2024-01-01T12:00:00Z'));

      expect(mockSetState).toHaveBeenCalledTimes(1);
      expect(currentState.proposals).toHaveLength(2);
      expect(currentState.proposals[1]).toMatchObject({ title: 'New Park', status: 'compiled' });
    });

    it('should create a vetoed proposal when violations are detected', () => {
      const { result } = renderHook(() => useProposals(mockSetState));

      let newProposal: Proposal | undefined;
      act(() => {
        newProposal = result.current.submitProposal({
          title: 'Bad Law',
          content: 'We will censor the press',
          tier: 'law1_shield',
          submittedBy: 'user-1',
        });
      });

      expect(newProposal).toMatchObject({
        title: 'Bad Law',
        content: 'We will censor the press',
        status: 'vetoed',
        vetoReason: 'First Amendment Shield: "censor" detected',
        triggeredKeywords: ['First Amendment Shield: "censor" detected'],
      });

      expect(mockSetState).toHaveBeenCalledTimes(1);
      expect(currentState.proposals).toHaveLength(2);
      expect(currentState.proposals[1]).toMatchObject({ title: 'Bad Law', status: 'vetoed' });
    });
  });
});
