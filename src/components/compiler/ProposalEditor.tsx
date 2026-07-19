import { Code2, Send } from 'lucide-react';
import { TierSelector } from './TierSelector';

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
          <TierSelector
            selectedTier={selectedTier}
            setSelectedTier={setSelectedTier}
          />
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
