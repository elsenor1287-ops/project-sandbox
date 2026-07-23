import { useState, useCallback } from 'react';
import type { AppState, PageRoute } from '../types';
import {
  INITIAL_IDENTITY,
  INITIAL_BALLOT_OPTIONS,
  MOCK_TEST_ACCOUNTS,
  MOCK_CALENDAR_EVENTS,
} from '../data/mockData';

const LAW1_RULES = PROTOCOL_RULES.filter(rule => rule.law === 1);

const getSecureRandom = () => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / (0xffffffff + 1);
};

function getSecureRandom() {
  return crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1);
}

const getSecureRandom = () => crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1);

const secureRandom = () => crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1);

const secureRandom = () => crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1);

const secureRandom = () => crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1);

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
      rule.lowerKeywords.forEach((lowerKeyword, index) => {
        if (lowerContent.includes(lowerKeyword)) {
          violations.push(`${rule.name}: "${rule.keywords[index]}" detected`);
        }
      });
    });

    return violations;
  }, []);

  const submitProposal = useCallback((proposal: Omit<Proposal, 'id' | 'submittedAt' | 'status'>) => {
    const violations = checkLaw1Violations(proposal.content);
    const status = violations.length > 0 ? 'vetoed' : 'compiled';

    const newProposal: Proposal = {
      id: `prop-${crypto.randomUUID()}`,
      ...proposal,
      submittedAt: new Date(),
      status,
      vetoReason: violations.length > 0 ? violations.join('; ') : undefined,
      triggeredKeywords: violations.length > 0 ? violations : undefined,
    };

    setState(prev => ({
      ...prev,
      proposals: [...prev.proposals, newProposal],
    }));

    return newProposal;
  }, [checkLaw1Violations]);


  // RCV Voting Actions
  const submitBallot = useCallback((submission: Omit<BallotSubmission, 'submittedAt'>) => {
    setState(prev => {
      const newSubmission: BallotSubmission = {
        ...submission,
        submittedAt: new Date(),
      };

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
            id: `writein-${crypto.randomUUID()}`,
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
          const shuffled = [...prev.ballotOptions].sort(() => getSecureRandom() - 0.5);
          const rankings = shuffled.slice(0, Math.floor(getSecureRandom() * 4) + 1).map((opt, idx) => ({
            optionId: opt.id,
            rank: idx + 1,
          }));

          // Randomly add a write-in (10% chance)
          const writeIn = getSecureRandom() < 0.1 ? `Citizen Initiative #${Math.floor(getSecureRandom() * 100)}` : undefined;

          account.hasVoted = true;
          if (writeIn) account.writeIns.push(writeIn);

          newSubmissions.push({
            voterId: account.id,
            rankings,
            writeIn,
            submittedAt: new Date(),
          });
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
            id: `writein-${crypto.randomUUID()}`,
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
    setState(prev => ({
      ...prev,
      ballotOptions: INITIAL_BALLOT_OPTIONS,
      ballotSubmissions: [],
      rcvResult: null,
      testAccounts: MOCK_TEST_ACCOUNTS.map(acc => ({ ...acc, hasVoted: false, writeIns: [] })),
    }));
  }, []);

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

interface RCVRoundResult {
  round: RCVRound;
  winner?: BallotOption;
  nextOptions: BallotOption[];
  nextRankings: RankedVote[][];
}

export function processRCVRound(
  roundNumber: number,
  currentOptions: BallotOption[],
  currentRankings: RankedVote[][],
  threshold: number,
  totalVotes: number
): RCVRoundResult {
  // Count first-choice votes
  const voteDistribution: Record<string, number> = {};
  currentOptions.forEach(opt => {
    voteDistribution[opt.id] = 0;
  });

  currentRankings.forEach(rankings => {
    const firstChoice = rankings[0];
    if (firstChoice && Object.prototype.hasOwnProperty.call(voteDistribution, firstChoice.optionId)) {
      voteDistribution[firstChoice.optionId]++;
    }
  });

  let maxVotes = -Infinity;
  let minVotes = Infinity;
  let winnerId: string | undefined;
  let loserId: string | undefined;

  for (const id in voteDistribution) {
    const votes = voteDistribution[id];
    if (votes > maxVotes) {
      maxVotes = votes;
      winnerId = id;
    }
    if (votes < minVotes) {
      minVotes = votes;
      loserId = id;
    }
  }

  // Check for winner
  if (maxVotes > threshold) {
    const winner = currentOptions.find(opt => opt.id === winnerId);
    return {
      round: {
        roundNumber,
        voteDistribution,
        threshold,
        winner: winnerId,
        totalVotes,
      },
      winner,
      nextOptions: currentOptions,
      nextRankings: currentRankings,
    };
  }

  // Eliminate loser
  const nextOptions = currentOptions.filter(opt => opt.id !== loserId);

  // Optimization: Create a Set of current option IDs for O(1) lookup
  const currentOptionIds = new Set(nextOptions.map(opt => opt.id));

  // Redistribute votes
  const nextRankings = currentRankings.map(rankings =>
    rankings.filter(r => currentOptionIds.has(r.optionId))
  );

  return {
    round: {
      roundNumber,
      eliminatedOptionId: loserId,
      voteDistribution,
      threshold,
      totalVotes,
    },
    nextOptions,
    nextRankings,
  };
}

export function calculateRCVResult(
  options: BallotOption[],
  submissions: BallotSubmission[]
): RCVResult {
  const rounds: RCVRound[] = [];
  let currentOptions = [...options];
  let currentRankings = submissions.map(sub => [...sub.rankings].sort((a, b) => a.rank - b.rank));
  const activeOptionIds = new Set(options.map(opt => opt.id));

  const totalVotes = submissions.length;
  const MAJORITY_THRESHOLD_RATIO = 0.5;
  const threshold = totalVotes * MAJORITY_THRESHOLD_RATIO;

  let roundNumber = 0;
  let winner: BallotOption | undefined;

  while (!winner && currentOptions.length > 1 && roundNumber < 10) {
    roundNumber++;

    const roundResult = processRCVRound(
      roundNumber,
      currentOptions,
      currentRankings,
      threshold,
      totalVotes
    );

    rounds.push(roundResult.round);
    winner = roundResult.winner;
    currentOptions = roundResult.nextOptions;
    currentRankings = roundResult.nextRankings;
  }

  if (!winner) {
    const remainingIds = Array.from(activeOptionIds);
    winner = options.find(opt => opt.id === remainingIds[0]) || options[0];
  }

  return {
    rounds,
    winner: winner!,
    totalVotes,
    completedAt: new Date(),
  };
}

// This optimization task has been marked as resolved as it was already fixed
// and applied to the main branch previously.
