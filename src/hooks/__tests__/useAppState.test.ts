import { renderHook, act } from '@testing-library/react';
import { useAppState } from '../useAppState';

describe('useAppState', () => {
  describe('triggerFraudStrike', () => {
    it('should increment fraud strikes by 1', () => {
      const { result } = renderHook(() => useAppState());

      expect(result.current.state.identity.fraudStrikes).toBe(0);

      act(() => {
        result.current.triggerFraudStrike('test reason');
      });

      expect(result.current.state.identity.fraudStrikes).toBe(1);
      expect(result.current.state.identity.status).toBe('pending');
      expect(result.current.state.identity.frozenAt).toBeUndefined();
      expect(result.current.state.identity.frozenReason).toBeUndefined();
    });

    it('should freeze account on second strike', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.triggerFraudStrike('first reason');
        result.current.triggerFraudStrike('second reason');
      });

      expect(result.current.state.identity.fraudStrikes).toBe(2);
      expect(result.current.state.identity.status).toBe('frozen');
      expect(result.current.state.identity.frozenAt).toBeInstanceOf(Date);
      expect(result.current.state.identity.frozenReason).toBe('second reason');
    });

    it('should deactivate account on third strike', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.triggerFraudStrike('first reason');
        result.current.triggerFraudStrike('second reason');
        result.current.triggerFraudStrike('third reason');
      });

      expect(result.current.state.identity.fraudStrikes).toBe(3);
      expect(result.current.state.identity.status).toBe('deactivated');
      expect(result.current.state.identity.frozenAt).toBeInstanceOf(Date);
      expect(result.current.state.identity.frozenReason).toBe('third reason');
    });
  });
});
