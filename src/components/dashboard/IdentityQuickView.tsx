import { CheckCircle2 } from 'lucide-react';
import type { AppState } from '../../types';

interface IdentityQuickViewProps {
  identity: AppState['identity'];
  onNavigate: (page: AppState['currentPage']) => void;
}

export function IdentityQuickView({ identity, onNavigate }: IdentityQuickViewProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary-200">Identity Status</h2>
        <button
          onClick={() => onNavigate('/identity')}
          className="text-sm text-accent-400 hover:text-accent-300"
        >
          Manage
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-400">Citizen ID</span>
          <span className="font-mono text-primary-200 text-sm">{identity.citizenId}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-400">Passport Verified</span>
          {identity.passportVerified ? (
            <CheckCircle2 className="w-5 h-5 text-success-400" />
          ) : (
            <span className="text-xs text-warning-400">Pending</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-400">Utility Linked</span>
          {identity.utilityVerified ? (
            <CheckCircle2 className="w-5 h-5 text-success-400" />
          ) : (
            <span className="text-xs text-warning-400">Pending</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-400">Neighbor Vouches</span>
          <span className="text-sm text-primary-200">
            {identity.vouchTokens.length}/3
          </span>
        </div>
      </div>
    </div>
  );
}
