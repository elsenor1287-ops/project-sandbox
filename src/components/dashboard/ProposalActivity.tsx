import { FileText } from 'lucide-react';
import type { AppState } from '../../types';

interface ProposalActivityProps {
  proposals: AppState['proposals'];
  onNavigate: (page: AppState['currentPage']) => void;
}

export function ProposalActivity({ proposals, onNavigate }: ProposalActivityProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary-200">Proposal Activity</h2>
        <button
          onClick={() => onNavigate('/compiler')}
          className="text-sm text-accent-400 hover:text-accent-300"
        >
          Compile
        </button>
      </div>

      {proposals.length === 0 ? (
        <div className="text-center py-8 text-primary-500">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No proposals submitted</p>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.slice(-3).reverse().map(p => (
            <div
              key={p.id}
              className="p-3 bg-primary-800/30 rounded-lg flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-primary-200">{p.title}</p>
                <p className="text-xs text-primary-500">{p.tier}</p>
              </div>
              <span
                className={`badge ${
                  p.status === 'compiled' ? 'badge-success' : 'badge-danger'
                }`}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
