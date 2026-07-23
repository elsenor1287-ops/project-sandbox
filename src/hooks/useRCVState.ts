import { useState, useMemo } from 'react';
import type { BallotOption, BallotSubmission } from '../types';
import { calculateRCVResult } from './useAppState';

export interface RankedItem {
  optionId: string;
  rank: number;
}

export function useBallotState(onSubmitBallot: (submission: Omit<BallotSubmission, 'submittedAt'>) => void) {
  const [rankings, setRankings] = useState<RankedItem[]>([]);
  const [writeIn, setWriteIn] = useState('');
  const [showWriteInInput, setShowWriteInInput] = useState(false);

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
      const rankingsById = new Map<string, RankedItem>();
      for (const item of prev) {
        rankingsById.set(item.optionId, item);
      }

      const existing = rankingsById.get(optionId);
      if (existing) {
        if (newRank === 0) {
          rankingsById.delete(optionId);
          return Array.from(rankingsById.values());
        }

        // Shift others down
        rankingsById.delete(optionId);
        const others = Array.from(rankingsById.values());
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

  return {
    rankings,
    writeIn,
    showWriteInInput,
    setWriteIn,
    setShowWriteInInput,
    handleSubmit,
    handleRank,
    getRank,
  };
}

export function useSimulationState(
  ballotOptions: BallotOption[],
  submissions: BallotSubmission[],
  onRunSimulation: () => void
) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationRound, setSimulationRound] = useState(0);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationRound(0);
    onRunSimulation();

    // Animate through rounds
    const result = calculateRCVResult(ballotOptions, submissions);
    for (let i = 0; i < result.rounds.length; i++) {
      setSimulationRound(i + 1);
    }
    setIsSimulating(false);
  };

  return {
    isSimulating,
    simulationRound,
    handleRunSimulation,
  };
}
