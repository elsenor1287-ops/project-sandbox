interface RuleTabsProps {
  activeRuleTab: 'law1' | 'law2' | 'law3';
  setActiveRuleTab: (tab: 'law1' | 'law2' | 'law3') => void;
}

export function RuleTabs({ activeRuleTab, setActiveRuleTab }: RuleTabsProps) {
  return (
    <div className="flex gap-4 mb-4">
      {(['law1', 'law2', 'law3'] as const).map(tier => (
        <button
          key={tier}
          onClick={() => setActiveRuleTab(tier)}
          className={`btn ${
            activeRuleTab === tier
              ? tier === 'law1'
                ? 'bg-danger-500/20 text-danger-300 border-danger-500/30'
                : tier === 'law2'
                ? 'bg-success-500/20 text-success-300 border-success-500/30'
                : 'bg-accent-500/20 text-accent-300 border-accent-500/30'
              : 'btn-ghost'
          }`}
        >
          {tier === 'law1' ? 'Law 1 Rules' : tier === 'law2' ? 'Law 2 Rules' : 'Law 3 Rules'}
        </button>
      ))}
    </div>
  );
}
