import type { Proposal } from '../../types';
import { ProposalEditor } from './ProposalEditor';
import { CompilerOutput } from './CompilerOutput';

interface CompilerWorkspaceProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  selectedTier: 'law1_shield' | 'law2_sandbox' | 'law3_dynamic';
  setSelectedTier: (tier: 'law1_shield' | 'law2_sandbox' | 'law3_dynamic') => void;
  isCompiling: boolean;
  handleCompile: () => void;
  compileResult: {
    success: boolean;
    violations: string[];
    proposal?: Proposal;
  } | null;
}

export function CompilerWorkspace({
  title,
  setTitle,
  content,
  setContent,
  selectedTier,
  setSelectedTier,
  isCompiling,
  handleCompile,
  compileResult,
}: CompilerWorkspaceProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <ProposalEditor
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        selectedTier={selectedTier}
        setSelectedTier={setSelectedTier}
        isCompiling={isCompiling}
        handleCompile={handleCompile}
      />
      <CompilerOutput
        compileResult={compileResult}
        content={content}
      />
    </div>
  );
}
