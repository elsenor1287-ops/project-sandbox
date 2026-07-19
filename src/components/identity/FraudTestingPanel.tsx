import { AlertTriangle, Zap, ShieldAlert, RefreshCw } from 'lucide-react';
import type { IdentityState } from '../../types';

interface FraudTestingPanelProps {
  identity: IdentityState;
  onTriggerFraud: (reason: string) => void;
  onFreezeAccount: (reason: string) => void;
  onResetIdentity: () => void;
}

export function FraudTestingPanel({
  identity,
  onTriggerFraud,
  onFreezeAccount,
  onResetIdentity,
}: FraudTestingPanelProps) {
  return (
    <div className="card p-6 border-danger-500/50 animate-in">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-danger-400" />
        <h2 className="text-xl font-semibold text-danger-400">
          Three-Strike Deactivation Pipeline
        </h2>
      </div>
      <p className="text-primary-400 text-sm mb-4">
        Trigger intentional fraud detection to test the account freeze cascade. This will
        freeze all associated vouching proxies.
      </p>

      {/* Strike Counter */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-sm text-primary-300">Strike Count:</span>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  identity.fraudStrikes >= i
                    ? 'bg-danger-500 text-white'
                    : 'bg-primary-700 text-primary-400'
                }`}
              >
                {i}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => onTriggerFraud('Biometric mismatch detected')}
          className="btn btn-secondary text-danger-300 border-danger-500/50 hover:bg-danger-500/20"
          disabled={identity.status === 'deactivated'}
        >
          <Zap className="w-4 h-4" />
          Trigger Strike
        </button>
        <button
          onClick={() => onFreezeAccount('Immediate freeze - multiple fraud indicators')}
          className="btn btn-danger"
          disabled={identity.status === 'deactivated'}
        >
          <ShieldAlert className="w-4 h-4" />
          Instant Freeze
        </button>
        <button onClick={onResetIdentity} className="btn btn-ghost">
          <RefreshCw className="w-4 h-4" />
          Reset Identity
        </button>
      </div>

      {identity.frozenReason && (
        <div className="mt-4 p-4 bg-danger-500/10 rounded-lg border border-danger-500/30">
          <p className="text-danger-300 text-sm">Freeze Reason: {identity.frozenReason}</p>
          <p className="text-danger-400 text-xs mt-1">
            Frozen at: {identity.frozenAt?.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
