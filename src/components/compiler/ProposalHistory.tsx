import { AlertCircle } from 'lucide-react';
import type { Proposal } from '../../types';

interface ProposalHistoryProps {
  proposals: Proposal[];
}

export function ProposalHistory({ proposals }: ProposalHistoryProps) {
  if (proposals.length === 0) return null;

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-primary-200 mb-4">Proposal History</h2>
      <div className="space-y-3">
        {proposals.map(p => (
          <div key={p.id} className="card-elevated p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-primary-200">{p.title}</h4>
              {p.status === 'compiled' ? (
                <span className="badge-success">Compiled</span>
              ) : (
                <span className="badge-danger">Vetoed</span>
              )}
            </div>
            <p className="text-sm text-primary-400 line-clamp-2">{p.content}</p>
            {p.vetoReason && (
              <div className="mt-2 flex items-center gap-2 text-xs text-danger-400">
                <AlertCircle className="w-3 h-3" />
                {p.vetoReason}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
