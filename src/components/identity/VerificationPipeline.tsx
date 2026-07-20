import { Scan, FileText, Users, CheckCircle2, RefreshCw } from 'lucide-react';
import type { IdentityState } from '../../types';

interface VerificationPipelineProps {
  identity: IdentityState;
  isScanning: boolean;
  onScan: () => void;
}

export function VerificationPipeline({ identity, isScanning, onScan }: VerificationPipelineProps) {
  const verificationSteps = [
    {
      id: 'passport',
      label: 'Passport Biometric',
      icon: Scan,
      isComplete: identity.passportVerified,
      isCurrent: identity.verificationStep === 'passport',
    },
    {
      id: 'utility',
      label: 'Utility Bill Credential',
      icon: FileText,
      isComplete: identity.utilityVerified,
      isCurrent: identity.verificationStep === 'utility',
    },
    {
      id: 'vouching',
      label: 'Peer Vouching (3 Neighbors)',
      icon: Users,
      isComplete: identity.status === 'active',
      isCurrent: identity.verificationStep === 'vouching',
    },
  ];

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-primary-200 mb-6">
        Multi-Step Verification Pipeline
      </h3>
      <div className="grid grid-cols-3 gap-6">
        {verificationSteps.map((step, idx) => (
          <div key={step.id} className="card-elevated p-6 relative">
            {step.isComplete && (
              <div className="absolute top-3 right-3">
                <CheckCircle2 className="w-5 h-5 text-success-400" />
              </div>
            )}
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${
                  step.isComplete
                    ? 'bg-success-500/20 border-success-500/30'
                    : step.isCurrent
                    ? 'bg-accent-500/20 border-accent-500/30 animate-pulse'
                    : 'bg-primary-700/50 border-primary-600/30'
                } border`}
              >
                <step.icon
                  className={`w-8 h-8 ${
                    step.isComplete
                      ? 'text-success-400'
                      : step.isCurrent
                      ? 'text-accent-400'
                      : 'text-primary-500'
                  }`}
                />
              </div>
              <h4 className="font-medium text-primary-200">{step.label}</h4>
              <p className="text-xs text-primary-500 mt-1">Step {idx + 1} of 3</p>

              {step.isCurrent && identity.status !== 'frozen' && (
                <button
                  onClick={onScan}
                  disabled={isScanning}
                  className="btn-primary btn mt-4 text-sm"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4" />
                      Verify Now
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
