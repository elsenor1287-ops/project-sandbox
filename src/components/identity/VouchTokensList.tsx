import { Users, CheckCircle2 } from 'lucide-react';
import type { IdentityState } from '../../types';

interface VouchTokensListProps {
  vouchTokens: IdentityState['vouchTokens'];
}

export function VouchTokensList({ vouchTokens }: VouchTokensListProps) {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-primary-200 mb-4">Neighbor Vouch Tokens</h3>

      {vouchTokens.length === 0 ? (
        <div className="text-center py-12 text-primary-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No vouch tokens received yet</p>
          <p className="text-sm mt-1">Complete verification to request neighbor signatures</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {vouchTokens.map(token => (
            <div
              key={token.id}
              className="card-elevated p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-success-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success-400" />
              </div>
              <div>
                <p className="font-medium text-primary-200">{token.neighborName}</p>
                <p className="text-xs text-primary-400">{token.neighborAddress}</p>
                <p className="text-xs text-primary-500 mt-1">
                  {token.signedAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
