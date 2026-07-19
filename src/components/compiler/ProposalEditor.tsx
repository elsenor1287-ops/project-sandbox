import { Code2, Send, Lock } from 'lucide-react';
import { getTierInfo } from './utils';

interface ProposalEditorProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  selectedTier: 'law1_shield' | 'law2_sandbox' | 'law3_dynamic';
  setSelectedTier: (tier: 'law1_shield' | 'law2_sandbox' | 'law3_dynamic') => void;
  isCompiling: boolean;
  handleCompile: () => void;
}

export function ProposalEditor({
  title,
  setTitle,
  content,
  setContent,
  selectedTier,
  setSelectedTier,
  isCompiling,
  handleCompile,
}: ProposalEditorProps) {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-primary-200 mb-4 flex items-center gap-2">
        <Code2 className="w-5 h-5" />
        Proposal Editor
      </h2>

      <div className="space-y-4">
        <div>
          <label className="label">Proposal Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="input"
            placeholder="Enter proposal title..."
          />
        </div>

        <div>
          <label className="label">Governance Tier</label>
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
        </div>

        <div>
          <label className="label">Proposal Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="input min-h-[200px] font-mono text-sm"
            placeholder="Enter your proposal content here...&#10;&#10;Tip: Try adding words like 'ban speech' or 'seize weapons' to test Law 1 shield violations."
          />
        </div>

        <button
          onClick={handleCompile}
          disabled={!title || !content || isCompiling}
          className="btn-primary w-full"
        >
          {isCompiling ? (
            <>
              <span className="animate-spin">⏳</span>
              Compiling Proposal...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Compile & Submit
            </>
          )}
        </button>
      </div>
    </div>
  );
}
