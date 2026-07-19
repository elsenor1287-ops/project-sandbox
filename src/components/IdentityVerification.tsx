import { AlertOctagon } from 'lucide-react';
import React from 'react';
import type { IdentityState, VerificationStep } from '../types';
import { FraudTestingPanel } from './identity/FraudTestingPanel';
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
  onTriggerFraud,
  onFreezeAccount,
  onResetIdentity,
}: IdentityPageProps) {
  const [showFraudPanel, setShowFraudPanel] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsScanning(false);
    onCompleteStep('passport');
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Identity Wallet</h1>
          <p className="text-primary-400 mt-1">Self-sovereign credential verification</p>
        </div>
        <button
          onClick={() => setShowFraudPanel(!showFraudPanel)}
          className={`btn ${showFraudPanel ? 'btn-danger' : 'btn-secondary'}`}
        >
          <AlertOctagon className="w-4 h-4" />
          Fraud Testing Suite
        </button>
      </div>

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
