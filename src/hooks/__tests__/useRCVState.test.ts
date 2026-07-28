import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useBallotState } from '../useRCVState';

describe('useBallotState', () => {
  it('should initialize with empty rankings', () => {
    const onSubmitMock = vi.fn();
    const { result } = renderHook(() => useBallotState(onSubmitMock));
    expect(result.current.rankings).toEqual([]);
  });

  it('should handle adding a rank', () => {
    const onSubmitMock = vi.fn();
    const { result } = renderHook(() => useBallotState(onSubmitMock));
    act(() => {
      result.current.handleRank('opt1', 1);
    });
    expect(result.current.rankings).toEqual([{ optionId: 'opt1', rank: 1 }]);
  });

  it('should handle updating an existing rank and shifting others', () => {
    const onSubmitMock = vi.fn();
    const { result } = renderHook(() => useBallotState(onSubmitMock));
    act(() => {
      result.current.handleRank('opt1', 1);
      result.current.handleRank('opt2', 2);
    });
    act(() => {
      result.current.handleRank('opt2', 1);
    });
    expect(result.current.rankings).toEqual([
      { optionId: 'opt2', rank: 1 },
      { optionId: 'opt1', rank: 2 },
    ]);
  });

  it('should handle removing a rank when newRank is 0', () => {
    const onSubmitMock = vi.fn();
    const { result } = renderHook(() => useBallotState(onSubmitMock));
    act(() => {
      result.current.handleRank('opt1', 1);
      result.current.handleRank('opt2', 2);
    });
    act(() => {
      result.current.handleRank('opt1', 0);
    });
    expect(result.current.rankings).toEqual([
      { optionId: 'opt2', rank: 2 },
    ]);
  });

  it('should handle submitting the ballot and resetting state', () => {
    const onSubmitMock = vi.fn();
    const { result } = renderHook(() => useBallotState(onSubmitMock));
    act(() => {
      result.current.handleRank('opt1', 1);
      result.current.setWriteIn('My Write In');
      result.current.setShowWriteInInput(true);
    });
    act(() => {
      result.current.handleSubmit();
    });
    expect(onSubmitMock).toHaveBeenCalledWith({
      voterId: 'CITIZEN-2024-01337',
      rankings: [{ optionId: 'opt1', rank: 1 }],
      writeIn: 'My Write In',
    });
    expect(result.current.rankings).toEqual([]);
    expect(result.current.writeIn).toBe('');
    expect(result.current.showWriteInInput).toBe(false);
  });
});
