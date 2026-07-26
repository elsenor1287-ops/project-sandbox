import { describe, it, expect } from 'vitest';
import { getTierInfo } from './utils';
import { Lock, Unlock, FileCode, Shield } from 'lucide-react';

describe('getTierInfo', () => {
  it('returns correct info for law1_shield', () => {
    const result = getTierInfo('law1_shield');
    expect(result).toEqual({
      label: 'Law 1: The Shield',
      icon: Lock,
      color: 'danger',
      desc: 'Protected inalienable rights'
    });
  });

  it('returns correct info for law2_sandbox', () => {
    const result = getTierInfo('law2_sandbox');
    expect(result).toEqual({
      label: 'Law 2: The Sandbox',
      icon: Unlock,
      color: 'success',
      desc: 'Local community logistics'
    });
  });

  it('returns correct info for law3_dynamic', () => {
    const result = getTierInfo('law3_dynamic');
    expect(result).toEqual({
      label: 'Law 3: Dynamic',
      icon: FileCode,
      color: 'accent',
      desc: 'Citizen write-in proposals'
    });
  });

  it('returns fallback info for unknown tiers', () => {
    const result = getTierInfo('unknown_tier');
    expect(result).toEqual({
      label: 'unknown_tier',
      icon: Shield,
      color: 'neutral',
      desc: ''
    });
  });
});
