import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { AppState, Proposal } from '../types';
import { PROTOCOL_RULES } from '../data/mockData';

const LAW1_RULES = PROTOCOL_RULES.filter(rule => rule.law === 1);

export function useProposals(setState: Dispatch<SetStateAction<AppState>>) {
  const checkLaw1Violations = useCallback((content: string): string[] => {
    const violations: string[] = [];
    const lowerContent = content.toLowerCase();

    LAW1_RULES.forEach(rule => {
      // Memory note: pre-existing issue where lowerKeywords is missing from some ProtocolRules
      const keywords = (rule as any).lowerKeywords || rule.keywords.map(k => k.toLowerCase());
      keywords.forEach((lowerKeyword: string, index: number) => {
        if (lowerContent.includes(lowerKeyword)) {
          violations.push(`${rule.name}: "${rule.keywords[index]}" detected`);
        }
      });
    });

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
