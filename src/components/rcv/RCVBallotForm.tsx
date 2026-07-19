import { Vote, Plus, X, Check } from 'lucide-react';
import type { BallotOption } from '../../types';
import { RCVOptionCard } from './RCVOptionCard';

interface RankedItem {
  optionId: string;
  rank: number;
}

interface RCVBallotFormProps {
  ballotOptions: BallotOption[];
  rankings: RankedItem[];
  writeIn: string;
  showWriteInInput: boolean;
  onRank: (optionId: string, newRank: number) => void;
  onWriteInChange: (value: string) => void;
  onToggleWriteIn: (show: boolean) => void;
  onSubmit: () => void;
  getRank: (optionId: string) => number;
}

export function RCVBallotForm({
  ballotOptions,
  rankings,
  writeIn,
  showWriteInInput,
  onRank,
  onWriteInChange,
  onToggleWriteIn,
  onSubmit,
  getRank,
}: RCVBallotFormProps) {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-primary-200 mb-4 flex items-center gap-2">
        <Vote className="w-5 h-5" />
        Ranked-Choice Ballot
        {rankings.length > 0 && (
          <span className="badge-success ml-auto">
            {rankings.length} Ranked
          </span>
        )}
      </h2>

      <p className="text-sm text-primary-400 mb-6">
        Click rank buttons to order your preferences (1st, 2nd, 3rd...). Lower number = higher preference.
      </p>

      <div className="space-y-3">
        {ballotOptions.map(option => (
          <RCVOptionCard
            key={option.id}
            option={option}
            currentRank={getRank(option.id)}
            onRank={onRank}
          />
        ))}

        {/* Write-In Option */}
        {!showWriteInInput ? (
          <button
            onClick={() => onToggleWriteIn(true)}
            className="w-full card-elevated p-4 border-dashed border-2 border-primary-600 hover:border-accent-500 text-primary-400 hover:text-accent-400 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Write-In Candidate
          </button>
        ) : (
          <div className="card-elevated p-4 border-warning-500/50">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={writeIn}
                onChange={e => onWriteInChange(e.target.value)}
                className="input flex-1"
                placeholder="Enter your write-in candidate name..."
                autoFocus
              />
              <button
                onClick={() => {
                  onToggleWriteIn(false);
                  onWriteInChange('');
                }}
                className="btn-ghost"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-warning-400 mt-2">
              Write-ins repeated by multiple voters become rankable options
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={rankings.length === 0}
        className="btn-success w-full mt-6"
      >
        <Check className="w-4 h-4" />
        Submit Ballot
      </button>
    </div>
  );
}
