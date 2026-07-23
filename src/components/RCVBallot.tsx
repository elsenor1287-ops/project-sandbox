import { useMemo } from 'react';
import { useBallotState, useSimulationState } from '../hooks/useRCVState';
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




interface ConnectedBallotFormProps {
  ballotOptions: BallotOption[];
  onSubmitBallot: (submission: Omit<BallotSubmission, 'submittedAt'>) => void;
}

function ConnectedBallotForm({ ballotOptions, onSubmitBallot }: ConnectedBallotFormProps) {
  const {
    rankings,
    writeIn,
    showWriteInInput,
    setWriteIn,
    setShowWriteInInput,
    handleSubmit,
    handleRank,
    getRank,
  } = useBallotState(onSubmitBallot);

  return (
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
  );
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


  const { isSimulating, simulationRound, handleRunSimulation } = useSimulationState(
    ballotOptions,
    submissions,
    onRunSimulation
  );

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
        <ConnectedBallotForm
          ballotOptions={ballotOptions}
          onSubmitBallot={onSubmitBallot}
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
