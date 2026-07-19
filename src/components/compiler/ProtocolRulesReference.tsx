import { useState } from 'react';
import { PROTOCOL_RULES } from '../../data/mockData';

export function ProtocolRulesReference() {
  const [activeRuleTab, setActiveRuleTab] = useState<'law1' | 'law2' | 'law3'>('law1');

  const law1Rules = PROTOCOL_RULES.filter(r => r.law === 1);
  const law2Rules = PROTOCOL_RULES.filter(r => r.law === 2);
  const law3Rules = PROTOCOL_RULES.filter(r => r.law === 3);

  return (
    <div className="card p-6">
      <div className="flex gap-4 mb-4">
        {['law1', 'law2', 'law3'].map(tier => (
          <button
            key={tier}
            onClick={() => setActiveRuleTab(tier as typeof activeRuleTab)}
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

      <div className="space-y-3">
        {(activeRuleTab === 'law1'
          ? law1Rules
          : activeRuleTab === 'law2'
          ? law2Rules
          : law3Rules
        ).map(rule => (
          <div
            key={rule.id}
            className={`p-4 rounded-lg ${
              rule.isProtected
                ? 'bg-danger-500/10 border border-danger-500/30'
                : 'bg-primary-800/50 border border-primary-700/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-primary-200">{rule.name}</h4>
              {rule.isProtected ? (
                <span className="badge-danger">Protected</span>
              ) : (
                <span className="badge-success">RCV Eligible</span>
              )}
            </div>
            <p className="text-sm text-primary-400">{rule.description}</p>
            {rule.keywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {rule.keywords.map(kw => (
                  <span key={kw} className="text-xs bg-primary-700/50 text-primary-300 px-2 py-1 rounded">
                    "{kw}"
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
