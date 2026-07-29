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

  it('should not shift ranks that are less than the new rank when updating', () => {
    const onSubmitMock = vi.fn();
    const { result } = renderHook(() => useBallotState(onSubmitMock));
    act(() => {
      result.current.handleRank('opt1', 1);
      result.current.handleRank('opt2', 2);
      result.current.handleRank('opt3', 3);
    });
    act(() => {
      // Move opt3 from rank 3 to rank 2.
      // opt1 (rank 1) is < 2, so it should not be shifted.
      // opt2 (rank 2) is >= 2, so it should be shifted to 3.
      result.current.handleRank('opt3', 2);
    });
    expect(result.current.rankings).toEqual([
      { optionId: 'opt1', rank: 1 },
      { optionId: 'opt3', rank: 2 },
      { optionId: 'opt2', rank: 3 },
    ]);
  });

  it('should handle adding new ranks out of order and sorting them correctly', () => {
    const onSubmitMock = vi.fn();
    const { result } = renderHook(() => useBallotState(onSubmitMock));
    act(() => {
      result.current.handleRank('opt1', 2);
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

  it('should get rank for an option using getRank', () => {
    const onSubmitMock = vi.fn();
    const { result } = renderHook(() => useBallotState(onSubmitMock));
    act(() => {
      result.current.handleRank('opt1', 2);
    });
    expect(result.current.getRank('opt1')).toBe(2);
    expect(result.current.getRank('opt2')).toBe(0);
  });

  it('should handle submitting the ballot without writeIn', () => {
    const onSubmitMock = vi.fn();
    const { result } = renderHook(() => useBallotState(onSubmitMock));
    act(() => {
      result.current.handleRank('opt1', 1);
    });
    act(() => {
      result.current.handleSubmit();
    });
    expect(onSubmitMock).toHaveBeenCalledWith({
      voterId: 'CITIZEN-2024-01337',
      rankings: [{ optionId: 'opt1', rank: 1 }],
      writeIn: undefined,
    });
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

  it('should handle updating an existing rank and shift down ranks that are >= the new rank', () => {
    const onSubmitMock = vi.fn();
    const { result } = renderHook(() => useBallotState(onSubmitMock));
    act(() => {
      result.current.handleRank('opt1', 1);
      result.current.handleRank('opt2', 2);
      result.current.handleRank('opt3', 3);
    });

    act(() => {
      result.current.handleRank('opt3', 2);
    });

    expect(result.current.rankings).toEqual([
      { optionId: 'opt1', rank: 1 },
      { optionId: 'opt3', rank: 2 },
      { optionId: 'opt2', rank: 3 },
    ]);
  });

});
