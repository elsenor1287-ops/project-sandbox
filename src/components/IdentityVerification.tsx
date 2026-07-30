<<<<<<< Updated upstream
=======
import {
  Fingerprint,
  FileText,
  Users,
  CheckCircle2,
  Shield,
  ShieldAlert,
  ShieldX,
  Scan,
  RefreshCw,
} from 'lucide-react';
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Identity Wallet</h1>
          <p className="text-primary-400 mt-1">Self-sovereign credential verification</p>
        </div>
      </div>

      {/* Active Vouch Requests Tray */}
      <div className="card p-6 bg-primary-900/40 border border-primary-800 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-accent-950/50 border border-accent-800 rounded-lg text-accent-400 mt-0.5">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-primary-100 flex items-center gap-2">
                Active Vouch Requests
                {!isVouched && (
                  <span className="badge-warning bg-warning-500/10 text-warning-400 border-warning-500/20 text-[10px] px-2 py-0.5">
                    1 Pending
                  </span>
                )}
              </h2>
              <p className="text-primary-300 text-sm mt-1">
                New resident in Hillsborough County is requesting a neighbor vouch.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isVouched ? (
              <span className="badge-success bg-success-500/10 text-success-400 border border-success-500/20 py-2 px-4 rounded-lg flex items-center gap-1.5 text-sm font-medium animate-in fade-in zoom-in-95 duration-300">
                <CheckCircle2 className="w-4 h-4" />
                Vouch Verified
              </span>
            ) : (
              <button
                onClick={handleVerifyNeighbor}
                disabled={isVouchingInProgress}
                className="btn btn-primary bg-accent-600 hover:bg-accent-500 text-white border-none shadow-lg shadow-accent-600/20 hover:shadow-accent-500/30 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              >
                {isVouchingInProgress ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Signing Vouch...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Verify Neighbor
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
>>>>>>> Stashed changes

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
