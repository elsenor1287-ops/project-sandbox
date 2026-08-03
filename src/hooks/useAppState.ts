import { useState, useCallback, useEffect } from 'react';
import type { AppState, PageRoute, Proposal, BallotSubmission } from '../types';
import { isSupabaseConfigured, dbFetchProposals, dbInsertProposal, dbFetchBallotSubmissions, dbInsertBallotSubmission } from '../lib/supabase';
import {
  INITIAL_IDENTITY,
  INITIAL_BALLOT_OPTIONS,
  MOCK_TEST_ACCOUNTS,
  MOCK_CALENDAR_EVENTS,
} from '../data/mockData';
import { useIdentity } from './useIdentity';
import { useProposals } from './useProposals';
import { useVoting, calculateRCVResult, processRCVRound } from './useVoting';

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

  // Sync with Supabase on mount if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const loadData = async () => {
      try {
        let fetchedProposals = await dbFetchProposals();
        if (fetchedProposals !== null) {
          if (fetchedProposals.length === 0) {
            // Seed default proposals so user gets instant rows
            const seedProposals: Proposal[] = [
              {
                id: 'prop-seed-1',
                title: 'Tampa Green Canopy Restoration Act',
                content: 'An initiative to allocate municipal budget for planting 1,000 new native oak trees in high-heat urban areas and restoring community green spaces.',
                tier: 'sandbox-1',
                submittedBy: 'Sarah Chen',
                submittedAt: new Date('2024-02-05T10:00:00Z'),
                status: 'compiled'
              },
              {
                id: 'prop-seed-2',
                title: 'Digital Inclusion Community Centers',
                content: 'Constructing free public learning centers equipped with high-speed internet, smart computer workstations, and professional STEM tutoring mentors.',
                tier: 'sandbox-3',
                submittedBy: 'Michael Rodriguez',
                submittedAt: new Date('2024-02-08T14:30:00Z'),
                status: 'compiled'
              },
              {
                id: 'prop-seed-3',
                title: 'Asimov Security Code Verification Amendment',
                content: 'We propose to censor and silence any individual who speaks against the protocol rules or attempts to modify the primary charter.',
                tier: 'shield-1',
                submittedBy: 'System Watchdog Bot',
                submittedAt: new Date('2024-02-12T09:15:00Z'),
                status: 'vetoed',
                vetoReason: 'First Amendment Shield: "censor" detected; First Amendment Shield: "silence" detected',
                triggeredKeywords: ['First Amendment Shield: "censor" detected', 'First Amendment Shield: "silence" detected']
              }
            ];

            for (const p of seedProposals) {
              await dbInsertProposal(p);
            }
            fetchedProposals = seedProposals;
          }
          setState(prev => ({ ...prev, proposals: fetchedProposals! }));
        }

        let fetchedSubmissions = await dbFetchBallotSubmissions();
        if (fetchedSubmissions !== null) {
          if (fetchedSubmissions.length === 0) {
            // Seed default submissions
            const seedSubmissions: BallotSubmission[] = [
              {
                voterId: 'test-1',
                rankings: [
                  { optionId: 'opt-1', rank: 1 },
                  { optionId: 'opt-2', rank: 2 },
                  { optionId: 'opt-3', rank: 3 }
                ],
                submittedAt: new Date('2024-02-14T08:00:00Z')
              },
              {
                voterId: 'test-2',
                rankings: [
                  { optionId: 'opt-2', rank: 1 },
                  { optionId: 'opt-1', rank: 2 },
                  { optionId: 'opt-5', rank: 3 }
                ],
                submittedAt: new Date('2024-02-14T09:12:00Z')
              },
              {
                voterId: 'test-3',
                rankings: [
                  { optionId: 'opt-3', rank: 1 },
                  { optionId: 'opt-6', rank: 2 },
                  { optionId: 'opt-2', rank: 3 }
                ],
                submittedAt: new Date('2024-02-14T11:45:00Z')
              }
            ];

            for (const s of seedSubmissions) {
              await dbInsertBallotSubmission(s);
            }
            fetchedSubmissions = seedSubmissions;
          }

          const votedUserIds = new Set(fetchedSubmissions.map(s => s.voterId));
          setState(prev => {
            const updatedAccounts = prev.testAccounts.map(acc => {
              if (votedUserIds.has(acc.id)) {
                return { ...acc, hasVoted: true };
              }
              return acc;
            });
            return {
              ...prev,
              ballotSubmissions: fetchedSubmissions!,
              testAccounts: updatedAccounts
            };
          });
        }
      } catch (err) {
        console.error('Error loading data from Supabase:', err);
      }
    };

    loadData();
  }, []);

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

export { calculateRCVResult, processRCVRound };
