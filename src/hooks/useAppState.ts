<<<<<<< Updated upstream
import { useState, useCallback } from 'react';
import type { AppState, PageRoute } from '../types';
=======
import { useState, useCallback, useEffect } from 'react';
import { 
  dbFetchProposals, 
  dbInsertProposal, 
  dbFetchBallotSubmissions, 
  dbInsertBallotSubmission, 
  dbResetVotingSubmissions,
  isSupabaseConfigured
} from '../lib/supabase';
import type {
  AppState,
  PageRoute,
  VerificationStep,
  VouchToken,
  Proposal,
  BallotOption,
  BallotSubmission,
  RCVResult,
  RCVRound,
} from '../types';
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  const identityActions = useIdentity(setState);
  const proposalActions = useProposals(setState);
  const votingActions = useVoting(setState);
=======
  // Identity Actions
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
  }, []);

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
  }, []);

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
  }, []);

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
  }, []);

  const resetIdentity = useCallback(() => {
    setState(prev => ({
      ...prev,
      identity: INITIAL_IDENTITY,
    }));
  }, []);

  // Proposal Compiler Actions
  const checkLaw1Violations = useCallback((content: string): string[] => {
    const violations: string[] = [];
    const lowerContent = content.toLowerCase();

    LAW1_RULES.forEach(rule => {
      rule.keywords.forEach(keyword => {
        if (lowerContent.includes(keyword.toLowerCase())) {
          violations.push(`${rule.name}: "${keyword}" detected`);
        }
      });
    });

    return violations;
  }, []);

  const submitProposal = useCallback((proposal: Omit<Proposal, 'id' | 'submittedAt' | 'status'>) => {
    const violations = checkLaw1Violations(proposal.content);
    const status = violations.length > 0 ? 'vetoed' : 'compiled';

    const newProposal: Proposal = {
      id: `prop-${Date.now()}`,
      ...proposal,
      submittedAt: new Date(),
      status,
      vetoReason: violations.length > 0 ? violations.join('; ') : undefined,
      triggeredKeywords: violations.length > 0 ? violations : undefined,
    };

    // Sync to Supabase if configured
    if (isSupabaseConfigured) {
      dbInsertProposal(newProposal).catch(err => {
        console.error('Failed to sync proposal to Supabase:', err);
      });
    }

    setState(prev => ({
      ...prev,
      proposals: [...prev.proposals, newProposal],
    }));

    return newProposal;
  }, [checkLaw1Violations]);


  // RCV Voting Actions
  const submitBallot = useCallback((submission: Omit<BallotSubmission, 'submittedAt'>) => {
    const newSubmission: BallotSubmission = {
      ...submission,
      submittedAt: new Date(),
    };

    if (isSupabaseConfigured) {
      dbInsertBallotSubmission(newSubmission).catch(err => {
        console.error('Failed to sync submission to Supabase:', err);
      });
    }

    setState(prev => {
      const newBallotOptions = [...prev.ballotOptions];

      // Handle write-in
      if (submission.writeIn) {
        const existingWriteIn = newBallotOptions.find(
          opt => opt.isWriteIn && opt.title.toLowerCase() === submission.writeIn!.toLowerCase()
        );

        if (existingWriteIn) {
          existingWriteIn.writeInCount = (existingWriteIn.writeInCount || 0) + 1;
        } else {
          // Create new write-in option
          const newWriteInOption: BallotOption = {
            id: `writein-${Date.now()}`,
            title: submission.writeIn,
            description: 'Write-in candidate submitted by voters',
            budget: 0,
            category: 'other',
            voteCount: 0,
            isWriteIn: true,
            writeInCount: 1,
          };
          newBallotOptions.push(newWriteInOption);
        }
      }

      return {
        ...prev,
        ballotSubmissions: [...prev.ballotSubmissions, newSubmission],
        ballotOptions: newBallotOptions,
      };
    });
  }, []);

  const runRCVSimulation = useCallback(() => {
    setState(prev => {
      const result = calculateRCVResult(prev.ballotOptions, prev.ballotSubmissions);
      return { ...prev, rcvResult: result };
    });
  }, []);

  const generateMockVotes = useCallback((count: number) => {
    setState(prev => {
      const accounts = [...prev.testAccounts];
      const newSubmissions: BallotSubmission[] = [];

      for (let i = 0; i < Math.min(count, accounts.length); i++) {
        const account = accounts[i];
        if (!account.hasVoted) {
          // Generate random rankings
          const shuffled = [...prev.ballotOptions].sort(() => Math.random() - 0.5);
          const rankings = shuffled.slice(0, Math.floor(Math.random() * 4) + 1).map((opt, idx) => ({
            optionId: opt.id,
            rank: idx + 1,
          }));

          // Randomly add a write-in (10% chance)
          const writeIn = Math.random() < 0.1 ? `Citizen Initiative #${Math.floor(Math.random() * 100)}` : undefined;

          account.hasVoted = true;
          if (writeIn) account.writeIns.push(writeIn);

          const sub: BallotSubmission = {
            voterId: account.id,
            rankings,
            writeIn,
            submittedAt: new Date(),
          };
          newSubmissions.push(sub);

          // Sync to Supabase asynchronously
          if (isSupabaseConfigured) {
            dbInsertBallotSubmission(sub).catch(err => {
              console.error('Failed to sync generated mock submission to Supabase:', err);
            });
          }
        }
      }

      // Update ballot options with write-ins
      const newBallotOptions = [...prev.ballotOptions];
      const writeInCounts: Record<string, number> = {};

      newSubmissions.forEach(sub => {
        if (sub.writeIn) {
          writeInCounts[sub.writeIn] = (writeInCounts[sub.writeIn] || 0) + 1;
        }
      });

      const existingWriteIns = new Map<string, BallotOption>();
      for (const opt of newBallotOptions) {
        if (opt.isWriteIn) {
          existingWriteIns.set(opt.title.toLowerCase(), opt);
        }
      }

      Object.entries(writeInCounts).forEach(([writeIn, count]) => {
        const normalized = writeIn.toLowerCase();
        const existing = existingWriteIns.get(normalized);

        if (existing) {
          existing.writeInCount = (existing.writeInCount || 0) + count;
        } else {
          const newWriteInOption: BallotOption = {
            id: `writein-${Date.now()}-${crypto.randomUUID()}`,
            title: writeIn,
            description: 'Write-in candidate submitted by voters',
            budget: 0,
            category: 'other',
            voteCount: 0,
            isWriteIn: true,
            writeInCount: count,
          };
          newBallotOptions.push(newWriteInOption);
          existingWriteIns.set(normalized, newWriteInOption);
        }
      });

      return {
        ...prev,
        testAccounts: accounts,
        ballotSubmissions: [...prev.ballotSubmissions, ...newSubmissions],
        ballotOptions: newBallotOptions,
      };
    });
  }, []);

  const resetVoting = useCallback(() => {
    if (isSupabaseConfigured) {
      dbResetVotingSubmissions().catch(err => {
        console.error('Failed to reset submissions on Supabase:', err);
      });
    }

    setState(prev => ({
      ...prev,
      ballotOptions: INITIAL_BALLOT_OPTIONS,
      ballotSubmissions: [],
      rcvResult: null,
      testAccounts: MOCK_TEST_ACCOUNTS.map(acc => ({ ...acc, hasVoted: false, writeIns: [] })),
    }));
  }, []);
>>>>>>> Stashed changes

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
