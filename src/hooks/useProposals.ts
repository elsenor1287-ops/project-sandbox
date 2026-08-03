import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { AppState, Proposal } from '../types';
import { PROTOCOL_RULES } from '../data/mockData';

const LAW1_RULES = PROTOCOL_RULES.filter(rule => rule.law === 1).map(rule => ({
  ...rule,
  lowerKeywords: (rule as any).lowerKeywords || rule.keywords.map(k => k.toLowerCase())
}));

// Flattened keyword mappings for fast iteration
// This avoids O(N*M) nested loops by making a single O(1) flattened list.
const ALL_KEYWORDS_FLAT = LAW1_RULES.flatMap(rule =>
  rule.lowerKeywords.map((lowerKeyword: string, index: number) => ({
    keyword: lowerKeyword,
    message: `${rule.name}: "${rule.keywords[index]}" detected`
  }))
);

export function useProposals(setState: Dispatch<SetStateAction<AppState>>) {
  const checkLaw1Violations = useCallback((content: string): string[] => {
    const violations: string[] = [];
    const lowerContent = content.toLowerCase();

    // Iterate the flattened list O(K) where K is total number of keywords
    for (let i = 0; i < ALL_KEYWORDS_FLAT.length; i++) {
      if (lowerContent.includes(ALL_KEYWORDS_FLAT[i].keyword)) {
        violations.push(ALL_KEYWORDS_FLAT[i].message);
      }
    }

    return violations;
  }, []);

  const submitProposal = useCallback((proposal: Omit<Proposal, 'id' | 'submittedAt' | 'status'>) => {
    const violations = checkLaw1Violations(proposal.content);
    const status = violations.length > 0 ? 'vetoed' : 'compiled';

    const newProposal: Proposal = {
      id: `prop-${Date.now()}`,
      ...proposal,
      submittedAt: new Date(),
      status,
      vetoReason: violations.length > 0 ? violations.join('; ') : undefined,
      triggeredKeywords: violations.length > 0 ? violations : undefined,
    };

    setState(prev => ({
      ...prev,
      proposals: [...prev.proposals, newProposal],
    }));

    return newProposal;
  }, [checkLaw1Violations, setState]);

  return {
    checkLaw1Violations,
    submitProposal,
  };
}
