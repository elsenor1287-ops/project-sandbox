import { Lock } from 'lucide-react';
import { getTierInfo } from './utils';

interface TierSelectorProps {
  selectedTier: 'law1_shield' | 'law2_sandbox' | 'law3_dynamic';
  setSelectedTier: (tier: 'law1_shield' | 'law2_sandbox' | 'law3_dynamic') => void;
}

export function TierSelector({ selectedTier, setSelectedTier }: TierSelectorProps) {
  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {(['law1_shield', 'law2_sandbox', 'law3_dynamic'] as const).map(tier => {
          const info = getTierInfo(tier);
          return (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedTier === tier
                  ? tier === 'law1_shield'
                    ? 'bg-danger-500/20 border-danger-500/50'
                    : tier === 'law2_sandbox'
                    ? 'bg-success-500/20 border-success-500/50'
                    : 'bg-accent-500/20 border-accent-500/50'
                  : 'bg-primary-800/50 border-primary-700/50 hover:border-primary-500'
              }`}
            >
              <info.icon
                className={`w-5 h-5 mb-1 ${
                  tier === 'law1_shield'
                    ? 'text-danger-400'
                    : tier === 'law2_sandbox'
                    ? 'text-success-400'
                    : 'text-accent-400'
                }`}
              />
              <p className="text-sm font-medium text-primary-200">{info.label.split(': ')[0]}</p>
            </button>
          );
        })}
      </div>
      {selectedTier === 'law1_shield' && (
        <p className="text-xs text-danger-400 mt-2 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Shield tier proposals are automatically vetoed
        </p>
      )}
    </>
  );
}
