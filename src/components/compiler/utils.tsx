import { Lock, Unlock, FileCode, Shield } from 'lucide-react';

export const getTierInfo = (tier: string) => {
  switch (tier) {
    case 'law1_shield':
      return { label: 'Law 1: The Shield', icon: Lock, color: 'danger', desc: 'Protected inalienable rights' };
    case 'law2_sandbox':
      return { label: 'Law 2: The Sandbox', icon: Unlock, color: 'success', desc: 'Local community logistics' };
    case 'law3_dynamic':
      return { label: 'Law 3: Dynamic', icon: FileCode, color: 'accent', desc: 'Citizen write-in proposals' };
    default:
      return { label: tier, icon: Shield, color: 'neutral', desc: '' };
  }
};

export const highlightViolations = (text: string, violations: string[]) => {
  const keywords = violations
    .map(v => v.split('"')[1])
    .filter(Boolean) as string[];

  if (keywords.length === 0) return <>{text}</>;

  const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const isViolation = keywords.some(
          k => k.toLowerCase() === part.toLowerCase()
        );
        return isViolation ? (
          <span key={i} className="bg-danger-500/30 text-danger-300 px-1 rounded">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
};
