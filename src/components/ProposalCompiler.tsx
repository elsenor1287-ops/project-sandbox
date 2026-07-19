import type { Proposal } from '../types';

import { AsimovLawsOverview } from './compiler/AsimovLawsOverview';
import { ProtocolRulesReference } from './compiler/ProtocolRulesReference';
import { ProposalEditor } from './compiler/ProposalEditor';
import { CompilerOutput } from './compiler/CompilerOutput';
import { ProposalHistory } from './compiler/ProposalHistory';
import { useProposalCompiler } from './compiler/useProposalCompiler';

interface CompilerPageProps {
  proposals: Proposal[];
  onSubmitProposal: (
    proposal: Omit<Proposal, 'id' | 'submittedAt' | 'status'>
  ) => Proposal;
  onCheckViolations: (content: string) => string[];
}

export function CompilerPage({
  proposals,
  onSubmitProposal,
  onCheckViolations,
}: CompilerPageProps) {
  const {
    title,
    setTitle,
    content,
    setContent,
    selectedTier,
    setSelectedTier,
    isCompiling,
    compileResult,
    handleCompile,
  } = useProposalCompiler({ onSubmitProposal, onCheckViolations });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">Proposal Compiler Workspace</h1>
        <p className="text-primary-400 mt-1">
          Automated Asimov Protocol compliance verification for civic proposals
        </p>
      </div>

      <AsimovLawsOverview />
      <ProtocolRulesReference />

      {/* Compiler Interface */}
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

      <ProposalHistory proposals={proposals} />
    </div>
  );
}
