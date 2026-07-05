import { renderHook } from '@testing-library/react';
import { useAppState } from './useAppState';
import { describe, it, expect } from 'vitest';

describe('useAppState', () => {
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
