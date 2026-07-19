import { Shield, ShieldAlert, ShieldX, Fingerprint } from 'lucide-react';
import type { IdentityState } from '../../types';

interface IdentityStatusCardProps {
  identity: IdentityState;
}

export function IdentityStatusCard({ identity }: IdentityStatusCardProps) {
  const getStatusIcon = () => {
    switch (identity.status) {
      case 'active':
        return <Shield className="w-8 h-8 text-success-400" />;
      case 'frozen':
        return <ShieldAlert className="w-8 h-8 text-danger-400" />;
      case 'deactivated':
        return <ShieldX className="w-8 h-8 text-danger-600" />;
      default:
        return <Fingerprint className="w-8 h-8 text-warning-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (identity.status) {
      case 'active':
        return <span className="badge-success">Active</span>;
      case 'frozen':
        return <span className="badge-danger">Frozen</span>;
      case 'deactivated':
        return <span className="badge-danger bg-danger-500/30 text-danger-300">Deactivated</span>;
      default:
        return <span className="badge-warning">Pending</span>;
    }
  };

  return (
    <div className="card p-8 flex items-center gap-8">
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-800 flex items-center justify-center">
        {getStatusIcon()}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-primary-100">{identity.citizenId}</h2>
          {getStatusBadge()}
        </div>
        <p className="text-primary-400 text-sm">
          Created: {identity.createdAt.toLocaleDateString()}
        </p>
        <div className="flex gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-100">{identity.vouchTokens.length}</p>
            <p className="text-xs text-primary-400">Vouch Tokens</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-100">{identity.isVouchingFor.length}</p>
            <p className="text-xs text-primary-400">Vouching For</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-100">{identity.fraudStrikes}</p>
            <p className="text-xs text-primary-400">Fraud Strikes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
