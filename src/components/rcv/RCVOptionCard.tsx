import { ChevronUp, ChevronDown, X } from 'lucide-react';
import type { BallotOption } from '../../types';

interface RCVOptionCardProps {
  option: BallotOption;
  currentRank: number;
  onRank: (optionId: string, newRank: number) => void;
}

export function RCVOptionCard({ option, currentRank, onRank }: RCVOptionCardProps) {
  return (
    <div
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
}
