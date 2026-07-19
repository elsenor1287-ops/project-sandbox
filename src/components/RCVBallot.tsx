import { useState, useMemo } from 'react';
import { calculateRCVResult } from '../hooks/useAppState';
import { RCVHeader } from './rcv/RCVHeader';
import { RCVStats } from './rcv/RCVStats';
import { RCVBallotForm } from './rcv/RCVBallotForm';
import { RCVResults } from './rcv/RCVResults';
import { RCVSubmissions } from './rcv/RCVSubmissions';
import type { BallotOption, BallotSubmission, RCVResult, TestAccount } from '../types';

interface VotingPageProps {
  ballotOptions: BallotOption[];
  submissions: BallotSubmission[];
  testAccounts: TestAccount[];
  rcvResult: RCVResult | null;
  onSubmitBallot: (submission: Omit<BallotSubmission, 'submittedAt'>) => void;
  onRunSimulation: () => void;
  onGenerateMockVotes: (count: number) => void;
  onResetVoting: () => void;
}

interface RankedItem {
  optionId: string;
  rank: number;
}

export function VotingPage({
  ballotOptions,
  submissions,
  testAccounts,
  rcvResult,
  onSubmitBallot,
  onRunSimulation,
  onGenerateMockVotes,
  onResetVoting,
}: VotingPageProps) {
  const [rankings, setRankings] = useState<RankedItem[]>([]);
  const [writeIn, setWriteIn] = useState('');
  const [showWriteInInput, setShowWriteInInput] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationRound, setSimulationRound] = useState(0);

  const testAccountsMap = useMemo(() => {
    const map = new Map<string, TestAccount>();
    for (const acc of testAccounts) {
      map.set(acc.id, acc);
    }
    return map;
  }, [testAccounts]);

  const ballotOptionsMap = useMemo(() => {
    const map = new Map<string, BallotOption>();
    for (const opt of ballotOptions) {
      map.set(opt.id, opt);
    }
    return map;
  }, [ballotOptions]);

  const optionsMap = useMemo(
    () => new Map(ballotOptions.map(o => [o.id, o])),
    [ballotOptions]
  );
  const accountsMap = useMemo(
    () => new Map(testAccounts.map(a => [a.id, a])),
    [testAccounts]
  );


  const handleSubmit = () => {
    onSubmitBallot({
      voterId: 'CITIZEN-2024-01337',
      rankings: rankings.map(r => ({ optionId: r.optionId, rank: r.rank })),
      writeIn: writeIn || undefined,
    });
    setRankings([]);
    setWriteIn('');
    setShowWriteInInput(false);
  };

  const handleRank = (optionId: string, newRank: number) => {
    setRankings(prev => {
      const existing = prev.find(r => r.optionId === optionId);
      if (existing) {
        if (newRank === 0) {
          return prev.filter(r => r.optionId !== optionId);
        }
        // Shift others down
        const others = prev.filter(r => r.optionId !== optionId);
        const shifted = others.map(r => ({
          ...r,
          rank: r.rank >= newRank ? r.rank + 1 : r.rank,
        }));
        return [...shifted, { optionId, rank: newRank }].sort((a, b) => a.rank - b.rank);
      }
      return [...prev, { optionId, rank: newRank }].sort((a, b) => a.rank - b.rank);
    });
  };

  // Performance optimization: Memoized map for O(1) rank lookups
  const rankingsMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rankings) {
      map.set(r.optionId, r.rank);
    }
    return map;
  }, [rankings]);

  const getRank = (optionId: string) => rankingsMap.get(optionId) || 0;

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationRound(0);
    onRunSimulation();

    // Animate through rounds
    const result = calculateRCVResult(ballotOptions, submissions);
    for (let i = 0; i < result.rounds.length; i++) {
      await new Promise(r => setTimeout(r, 1000));
      setSimulationRound(i + 1);
    }
    setIsSimulating(false);
  };

  const votedCount = submissions.length;
  const totalVoters = testAccounts.length + 1;
  const participationRate = (votedCount / totalVoters) * 100;


  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <RCVHeader
        onGenerateMockVotes={onGenerateMockVotes}
        onRunSimulation={handleRunSimulation}
        onResetVoting={onResetVoting}
        isSimulating={isSimulating}
        hasSubmissions={submissions.length > 0}
      />

      {/* Stats */}
      <RCVStats
        votedCount={votedCount}
        totalVoters={totalVoters}
        participationRate={participationRate}
        activeOptionsCount={ballotOptions.length}
      />

      {/* Ballot Interface */}
      <div className="grid grid-cols-2 gap-6">
        <RCVBallotForm
          ballotOptions={ballotOptions}
          rankings={rankings}
          writeIn={writeIn}
          showWriteInInput={showWriteInInput}
          onRank={handleRank}
          onWriteInChange={setWriteIn}
          onToggleWriteIn={setShowWriteInInput}
          onSubmit={handleSubmit}
          getRank={getRank}
        />

        {/* RCV Results / Simulation */}
        <RCVResults
          rcvResult={rcvResult}
          simulationRound={simulationRound}
          optionsMap={optionsMap}
        />
      </div>

      {/* Recent Submissions */}
      <RCVSubmissions
        submissions={submissions}
        testAccountsMap={testAccountsMap}
        ballotOptionsMap={ballotOptionsMap}
        accountsMap={accountsMap}
        optionsMap={optionsMap}
      />
    </div>
  );
}
