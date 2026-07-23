import { AlertOctagon } from 'lucide-react';

interface IdentityPageHeaderProps {
  showFraudPanel: boolean;
  onToggleFraudPanel: () => void;
}

export function IdentityPageHeader({ showFraudPanel, onToggleFraudPanel }: IdentityPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Identity Wallet</h1>
        <p className="text-primary-400 mt-1">Self-sovereign credential verification</p>
      </div>
      <button
        onClick={onToggleFraudPanel}
        className={`btn ${showFraudPanel ? 'btn-danger' : 'btn-secondary'}`}
      >
        <AlertOctagon className="w-4 h-4" />
        Fraud Testing Suite
      </button>
    </div>
  );
}
