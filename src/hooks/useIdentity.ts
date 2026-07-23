import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { AppState, VerificationStep, VouchToken } from '../types';
import { INITIAL_IDENTITY, MOCK_VOUCH_TOKENS } from '../data/mockData';

export function useIdentity(setState: Dispatch<SetStateAction<AppState>>) {
  const completeVerificationStep = useCallback((step: VerificationStep) => {
    setState(prev => {
      const newIdentity = { ...prev.identity };

      switch (step) {
        case 'passport':
          newIdentity.passportVerified = true;
          newIdentity.verificationStep = 'utility';
          break;
        case 'utility':
          newIdentity.utilityVerified = true;
          newIdentity.verificationStep = 'vouching';
          break;
        case 'vouching':
          newIdentity.vouchTokens = MOCK_VOUCH_TOKENS;
          newIdentity.verificationStep = 'complete';
          newIdentity.status = 'active';
          break;
      }

      return { ...prev, identity: newIdentity };
    });
  }, [setState]);

  const addVouchToken = useCallback((token: VouchToken) => {
    setState(prev => {
      const newTokens = [...prev.identity.vouchTokens, token];
      const isComplete = newTokens.length >= 3;
      return {
        ...prev,
        identity: {
          ...prev.identity,
          vouchTokens: newTokens,
          verificationStep: isComplete ? 'complete' : 'vouching',
          status: isComplete ? 'active' : 'pending',
        },
      };
    });
  }, [setState]);

  const triggerFraudStrike = useCallback((reason: string) => {
    setState(prev => {
      const newStrikes = prev.identity.fraudStrikes + 1;
      const shouldFreeze = newStrikes >= 2;
      const shouldDeactivate = newStrikes >= 3;

      return {
        ...prev,
        identity: {
          ...prev.identity,
          fraudStrikes: newStrikes,
          status: shouldDeactivate ? 'deactivated' : shouldFreeze ? 'frozen' : prev.identity.status,
          frozenAt: shouldFreeze ? new Date() : undefined,
          frozenReason: shouldFreeze ? reason : undefined,
        },
      };
    });
  }, [setState]);

  const freezeAccount = useCallback((reason: string) => {
    setState(prev => ({
      ...prev,
      identity: {
        ...prev.identity,
        status: 'frozen',
        frozenAt: new Date(),
        frozenReason: reason,
        fraudStrikes: 3,
      },
    }));
  }, [setState]);

  const resetIdentity = useCallback(() => {
    setState(prev => ({
      ...prev,
      identity: INITIAL_IDENTITY,
    }));
  }, [setState]);

  return {
    completeVerificationStep,
    addVouchToken,
    triggerFraudStrike,
    freezeAccount,
    resetIdentity,
  };
}
