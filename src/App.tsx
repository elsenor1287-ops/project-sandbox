import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { Sidebar, Header } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { IdentityPage } from './components/IdentityVerification';
import { VotingPage } from './components/RCVBallot';
import { CompilerPage } from './components/ProposalCompiler';
import { LandingPage } from './components/LandingPage';

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  const {
    state,
    setCurrentPage,
    completeVerificationStep,
    triggerFraudStrike,
    freezeAccount,
    resetIdentity,
    submitProposal,
    checkLaw1Violations,
    submitBallot,
    runRCVSimulation,
    generateMockVotes,
    resetVoting,
  } = useAppState();

  if (!authenticated) {
    return <LandingPage onEnterDashboard={() => setAuthenticated(true)} />;
  }

  const renderPage = () => {
    switch (state.currentPage) {
      case '/dashboard':
        return <Dashboard state={state} onNavigate={setCurrentPage} />;
      case '/identity':
        return (
          <IdentityPage
            identity={state.identity}
            onCompleteStep={completeVerificationStep}
            onTriggerFraud={triggerFraudStrike}
            onFreezeAccount={freezeAccount}
            onResetIdentity={resetIdentity}
          />
        );
      case '/vote':
        return (
          <VotingPage
            ballotOptions={state.ballotOptions}
            submissions={state.ballotSubmissions}
            testAccounts={state.testAccounts}
            rcvResult={state.rcvResult}
            onSubmitBallot={submitBallot}
            onRunSimulation={runRCVSimulation}
            onGenerateMockVotes={generateMockVotes}
            onResetVoting={resetVoting}
          />
        );
      case '/compiler':
        return (
          <CompilerPage
            proposals={state.proposals}
            onSubmitProposal={submitProposal}
            onCheckViolations={checkLaw1Violations}
          />
        );
      default:
        return <Dashboard state={state} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-primary-950 flex">
      {/* Background Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)`,
        }}
      />

      {/* Sidebar */}
      <Sidebar
        currentPage={state.currentPage}
        onNavigate={setCurrentPage}
        identityStatus={state.identity.status}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        <Header />
        <main className="flex-1 overflow-auto">{renderPage()}</main>
      </div>
    </div>
  );
}

export default App;
