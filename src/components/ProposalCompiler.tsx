import type { Proposal } from '../types';

import { AsimovLawsOverview } from './compiler/AsimovLawsOverview';
import { ProtocolRulesReference } from './compiler/ProtocolRulesReference';
import { CompilerWorkspace } from './compiler/CompilerWorkspace';
import { ProposalHistory } from './compiler/ProposalHistory';
import { useProposalCompiler } from './compiler/useProposalCompiler';
import { CompilerHeader } from './compiler/CompilerHeader';

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
      <CompilerHeader />

      <AsimovLawsOverview />
      <ProtocolRulesReference />

      {/* Compiler Interface */}
      <CompilerWorkspace
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        selectedTier={selectedTier}
        setSelectedTier={setSelectedTier}
        isCompiling={isCompiling}
        handleCompile={handleCompile}
        compileResult={compileResult}
      />

      <ProposalHistory proposals={proposals} />
    </div>
  );
}
