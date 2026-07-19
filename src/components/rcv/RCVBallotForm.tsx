import { Vote, ChevronUp, ChevronDown, Plus, X, Check } from 'lucide-react';
import type { BallotOption } from '../../types';

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
        {ballotOptions.map(option => {
          const currentRank = getRank(option.id);
          return (
            <div
              key={option.id}
              className={`card-elevated p-4 transition-all ${
                currentRank > 0 ? 'border-accent-500/50 bg-accent-500/10' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank Controls */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => onRank(option.id, currentRank > 0 ? currentRank - 1 || 1 : 1)}
                    className="w-8 h-6 rounded flex items-center justify-center bg-primary-700 hover:bg-primary-600 text-primary-300 hover:text-primary-100 transition-colors"
                    disabled={currentRank === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <div className="w-8 h-8 rounded-lg bg-primary-700 flex items-center justify-center">
                    <span className={`font-mono font-bold ${currentRank > 0 ? 'text-accent-300' : 'text-primary-500'}`}>
                      {currentRank || '-'}
                    </span>
                  </div>
                  <button
                    onClick={() => onRank(option.id, currentRank + 1)}
                    className="w-8 h-6 rounded flex items-center justify-center bg-primary-700 hover:bg-primary-600 text-primary-300 hover:text-primary-100 transition-colors"
                    disabled={currentRank === 0}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Option Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-primary-200">{option.title}</h4>
                    {option.isWriteIn && <span className="badge-warning">Write-In</span>}
                  </div>
                  <p className="text-sm text-primary-400 line-clamp-2">{option.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-primary-500">
                      Budget: ${option.budget.toLocaleString()}
                    </span>
                    <span className="text-xs text-primary-400 uppercase">{option.category}</span>
                    {option.writeInCount && (
                      <span className="text-xs text-success-400">
                        {option.writeInCount} write-in votes
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Rank Buttons */}
                <div className="flex gap-1 flex-wrap justify-end max-w-[200px]">
                  {[1, 2, 3, 4, 5].map(rank => (
                    <button
                      key={rank}
                      onClick={() => onRank(option.id, rank)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        currentRank === rank
                          ? 'bg-accent-500 text-white'
                          : 'bg-primary-700 text-primary-400 hover:bg-primary-600 hover:text-primary-200'
                      }`}
                    >
                      {rank}
                    </button>
                  ))}
                  {currentRank > 0 && (
                    <button
                      onClick={() => onRank(option.id, 0)}
                      className="w-9 h-9 rounded-lg bg-danger-500/20 text-danger-400 hover:bg-danger-500/30 flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

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
