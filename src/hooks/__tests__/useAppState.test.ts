import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppState } from '../useAppState';

describe('useAppState', () => {

  describe('addVouchToken', () => {
    it('should add a vouch token and keep status pending if under 3 tokens', () => {
      const { result } = renderHook(() => useAppState());

      expect(result.current.state.identity.vouchTokens).toHaveLength(0);
      expect(result.current.state.identity.verificationStep).toBe('passport');
      expect(result.current.state.identity.status).toBe('pending');

      const mockToken = {
        id: 'token-1',
        neighborName: 'John Doe',
        neighborAddress: '123 Main St',
        signedAt: new Date(),
        isValid: true,
      };

      act(() => {
        result.current.addVouchToken(mockToken);
      });

      expect(result.current.state.identity.vouchTokens).toHaveLength(1);
      expect(result.current.state.identity.vouchTokens[0]).toEqual(mockToken);
      expect(result.current.state.identity.verificationStep).toBe('vouching');
      expect(result.current.state.identity.status).toBe('pending');
    });

    it('should complete verification and set status to active on 3rd token', () => {
      const { result } = renderHook(() => useAppState());

      const mockToken1 = { id: 'token-1', neighborName: 'John', neighborAddress: '123 Main', signedAt: new Date(), isValid: true };
      const mockToken2 = { id: 'token-2', neighborName: 'Jane', neighborAddress: '456 Elm', signedAt: new Date(), isValid: true };
      const mockToken3 = { id: 'token-3', neighborName: 'Bob', neighborAddress: '789 Oak', signedAt: new Date(), isValid: true };

      act(() => {
        result.current.addVouchToken(mockToken1);
        result.current.addVouchToken(mockToken2);
      });

      expect(result.current.state.identity.vouchTokens).toHaveLength(2);
      expect(result.current.state.identity.verificationStep).toBe('vouching');
      expect(result.current.state.identity.status).toBe('pending');

      act(() => {
        result.current.addVouchToken(mockToken3);
      });

      expect(result.current.state.identity.vouchTokens).toHaveLength(3);
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

  describe('runRCVSimulation', () => {
    it('should calculate and set rcvResult in state', () => {
      const { result } = renderHook(() => useAppState());

      // Setup mock votes to test simulation
      act(() => {
        result.current.generateMockVotes(5);
      });

      // Verify rcvResult is initially null
      expect(result.current.state.rcvResult).toBeNull();

      // Run simulation
      act(() => {
        result.current.runRCVSimulation();
      });

      // Verify rcvResult is updated
      expect(result.current.state.rcvResult).not.toBeNull();

      const rcvResult = result.current.state.rcvResult!;
      expect(rcvResult).toHaveProperty('winner');
      expect(rcvResult).toHaveProperty('rounds');
      expect(rcvResult.totalVotes).toBe(5);
      expect(rcvResult).toHaveProperty('completedAt');
    });
  });
});
