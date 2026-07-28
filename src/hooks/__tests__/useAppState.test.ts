import { renderHook, act } from '@testing-library/react';
import { useAppState } from '../useAppState';
import { MOCK_VOUCH_TOKENS } from '../../data/mockData';

describe('useAppState', () => {
  describe('completeVerificationStep', () => {
    it('should update passport verified state and move to utility step', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.completeVerificationStep('passport');
      });

      expect(result.current.state.identity.passportVerified).toBe(true);
      expect(result.current.state.identity.verificationStep).toBe('utility');
    });

    it('should update utility verified state and move to vouching step', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.completeVerificationStep('utility');
      });

      expect(result.current.state.identity.utilityVerified).toBe(true);
      expect(result.current.state.identity.verificationStep).toBe('vouching');
    });

    it('should assign mock vouch tokens and set status to active and step to complete', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.completeVerificationStep('vouching');
      });

      expect(result.current.state.identity.vouchTokens).toEqual(MOCK_VOUCH_TOKENS);
      expect(result.current.state.identity.verificationStep).toBe('complete');
      expect(result.current.state.identity.status).toBe('active');
    });
  });

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
