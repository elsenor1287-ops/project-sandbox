import React from 'react';
import type { IdentityState, VerificationStep } from '../types';
import { FraudTestingPanel } from './identity/FraudTestingPanel';
import { IdentityPageHeader } from './identity/IdentityPageHeader';
import { IdentityStatusCard } from './identity/IdentityStatusCard';
import { VerificationPipeline } from './identity/VerificationPipeline';
import { VouchTokensList } from './identity/VouchTokensList';

interface IdentityPageProps {
  identity: IdentityState;
  onCompleteStep: (step: VerificationStep) => void;
  onTriggerFraud: (reason: string) => void;
  onFreezeAccount: (reason: string) => void;
  onResetIdentity: () => void;
}

export function IdentityPage({
  identity,
  onCompleteStep,
}: IdentityPageProps) {
  const [isScanning, setIsScanning] = React.useState(false);
  const [isVouched, setIsVouched] = React.useState(false);
  const [isVouchingInProgress, setIsVouchingInProgress] = React.useState(false);

  const handleVerifyNeighbor = async () => {
    setIsVouchingInProgress(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsVouched(true);
    setIsVouchingInProgress(false);
  };

  const handleScan = async () => {
    setIsScanning(true);
    // Optimization: Removed the artificial 2000ms delay to improve performance and responsiveness during scanning.
    setIsScanning(false);
    onCompleteStep('passport');
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <IdentityPageHeader
        showFraudPanel={showFraudPanel}
        onToggleFraudPanel={() => setShowFraudPanel(!showFraudPanel)}
      />

      {/* Fraud Testing Panel */}
      {showFraudPanel && (
        <FraudTestingPanel
          identity={identity}
          onTriggerFraud={onTriggerFraud}
          onFreezeAccount={onFreezeAccount}
          onResetIdentity={onResetIdentity}
        />
      )}

      {/* Status Card */}
      <IdentityStatusCard identity={identity} />

      {/* Verification Pipeline */}
      <VerificationPipeline
        identity={identity}
        isScanning={isScanning}
        onScan={handleScan}
      />

      {/* Vouch Tokens */}
      <VouchTokensList vouchTokens={identity.vouchTokens} />
    </div>
  );
}
