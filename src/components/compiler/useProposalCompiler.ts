import { useState } from 'react';
import type { Proposal } from '../../types';

interface UseProposalCompilerProps {
  onSubmitProposal: (
    proposal: Omit<Proposal, 'id' | 'submittedAt' | 'status'>
  ) => Proposal;
  onCheckViolations: (content: string) => string[];
}

export function useProposalCompiler({
  onSubmitProposal,
  onCheckViolations,
}: UseProposalCompilerProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTier, setSelectedTier] = useState<'law1_shield' | 'law2_sandbox' | 'law3_dynamic'>(
    'law2_sandbox'
  );
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileResult, setCompileResult] = useState<{
    success: boolean;
    violations: string[];
    proposal?: Proposal;
  } | null>(null);

  const handleCompile = async () => {
    setIsCompiling(true);
    setCompileResult(null);

    // Simulate compilation delay
    await new Promise(r => setTimeout(r, 1500));

    const violations = onCheckViolations(content);

    if (violations.length > 0) {
      setCompileResult({
        success: false,
        violations,
      });
    } else {
      const proposal = onSubmitProposal({
        title,
        content,
        tier: selectedTier,
        submittedBy: 'CITIZEN-2024-01337',
      });

      setCompileResult({
        success: true,
        violations: [],
        proposal,
      });

      setTitle('');
      setContent('');
    }

    setIsCompiling(false);
  };

  return {
    title,
    setTitle,
    content,
    setContent,
    selectedTier,
    setSelectedTier,
    isCompiling,
    compileResult,
    handleCompile,
  };
}
