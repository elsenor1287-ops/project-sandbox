import { useState, useCallback } from 'react';
import type { AppState, PageRoute } from '../types';
import {
  INITIAL_IDENTITY,
  INITIAL_BALLOT_OPTIONS,
  MOCK_TEST_ACCOUNTS,
  MOCK_CALENDAR_EVENTS,
} from '../data/mockData';

import { useIdentity } from './useIdentity';
import { useProposals } from './useProposals';
import { useVoting, processRCVRound, calculateRCVResult } from './useVoting';

export { processRCVRound, calculateRCVResult };

const initialState: AppState = {
  currentPage: '/dashboard',
  identity: INITIAL_IDENTITY,
  proposals: [],
  ballotOptions: INITIAL_BALLOT_OPTIONS,
  ballotSubmissions: [],
  testAccounts: MOCK_TEST_ACCOUNTS,
  rcvResult: null,
  calendarEvents: MOCK_CALENDAR_EVENTS,
};

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);

  const setCurrentPage = useCallback((page: PageRoute) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const identityActions = useIdentity(setState);
  const proposalActions = useProposals(setState);
  const votingActions = useVoting(setState);

  return {
    state,
    setCurrentPage,
    // Identity
    ...identityActions,
    // Proposals
    ...proposalActions,
    // Voting
    ...votingActions,
  };
}
