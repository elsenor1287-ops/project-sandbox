import { renderHook, act } from '@testing-library/react';
import { useAppState } from './useAppState';
import { describe, it, expect } from 'vitest';

describe('useAppState', () => {
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

      // Check if the write-in option was created
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
        writeIn: 'jane doe', // case-insensitive check
      };

      act(() => {
        result.current.submitBallot(submission1);
        result.current.submitBallot(submission2);
      });

      expect(result.current.state.ballotSubmissions).toHaveLength(2);

      // Check if the write-in option was created and count incremented
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

      // No new option should be created
      expect(result.current.state.ballotOptions).toHaveLength(initialOptionsCount);
    });
  });
});
