import { useState, useRef, useMemo, useEffect } from 'react';
import {
  Shield,
  FileCode,
  Lock,
  Unlock,
  AlertCircle,
} from 'lucide-react';
import type { Proposal } from '../types';
import { AsimovLawsOverview } from './compiler/AsimovLawsOverview';
import { ProtocolRulesReference } from './compiler/ProtocolRulesReference';
import { CompilerWorkspace } from './compiler/CompilerWorkspace';
import { ProposalHistory } from './compiler/ProposalHistory';
import { useProposalCompiler } from './compiler/useProposalCompiler';
import { CompilerHeader } from './compiler/CompilerHeader';
import { PROTOCOL_RULES } from '../data/mockData';

interface CompilerPageProps {
  proposals: Proposal[];
  onSubmitProposal: (
    proposal: Omit<Proposal, 'id' | 'submittedAt' | 'status'>
  ) => Proposal;
  onCheckViolations: (content: string) => string[];
}

interface Segment {
  text: string;
  isViolation: boolean;
  keywordMatched: string;
}

const LAW1_VIOLATION_KEYWORDS = [
  "ban speech",
  "seize property",
  "warrantless search",
  "censor",
  "silence",
  "prohibit expression",
  "restrict press",
  "ban protest",
  "seize weapons",
  "confiscate guns",
  "ban firearms",
  "prohibit arms",
  "disarm citizens",
  "unreasonable search",
  "warrantless entry",
  "confiscate without",
  "without due process",
  "no trial",
  "summary punishment",
  "property without compensation",
  "confiscate property without pay",
  "discriminate against",
  "deny rights to",
  "separate but",
  "unequal treatment"
];

const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const LAW1_VIOLATION_REGEX = new RegExp(
  LAW1_VIOLATION_KEYWORDS
    .slice()
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join('|'),
  'gi'
);

function parseContent(text: string): Segment[] {
  if (!text) return [];

  const segments: Segment[] = [];
  let currentIndex = 0;

  for (const match of text.matchAll(LAW1_VIOLATION_REGEX)) {
    if (match.index !== undefined) {
      if (match.index > currentIndex) {
        segments.push({
          text: text.substring(currentIndex, match.index),
          isViolation: false,
          keywordMatched: "",
        });
      }
      segments.push({
        text: match[0],
        isViolation: true,
        keywordMatched: match[0],
      });
      currentIndex = match.index + match[0].length;
    }
  }

  if (currentIndex < text.length) {
    segments.push({
      text: text.substring(currentIndex),
      isViolation: false,
      keywordMatched: "",
    });
  }

  return segments;
}

export function CompilerPage({
  proposals,
  onSubmitProposal,
  onCheckViolations,
}: CompilerPageProps) {
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
  const [activeRuleTab, setActiveRuleTab] = useState<'law1' | 'law2' | 'law3'>('law1');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const segments = useMemo(() => parseContent(content), [content]);
  const hasValidationError = useMemo(() => segments.some(seg => seg.isViolation), [segments]);

  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  useEffect(() => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, [content]);

  const handleSpanMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.focus();

    const backdrop = backdropRef.current;
    if (backdrop) {
      backdrop.style.pointerEvents = 'none';
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el) {
        const clickEvent = new MouseEvent('mousedown', {
          clientX: e.clientX,
          clientY: e.clientY,
          bubbles: true,
          cancelable: true,
        });
        el.dispatchEvent(clickEvent);
      }
      backdrop.style.pointerEvents = 'auto';
    }
  };

  const law1Rules = PROTOCOL_RULES.filter(r => r.law === 1);
  const law2Rules = PROTOCOL_RULES.filter(r => r.law === 2);
  const law3Rules = PROTOCOL_RULES.filter(r => r.law === 3);

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

  const getTierInfo = (tier: string) => {
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

  const highlightViolations = (text: string, violations: string[]) => {
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

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">Proposal Compiler Workspace</h1>
        <p className="text-primary-400 mt-1">
          Automated Asimov Protocol compliance verification for civic proposals
        </p>
      </div>

      {/* Asimov's Laws Overview */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-primary-200 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Asimov's Three Laws of Governance
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="card-elevated p-4 border-danger-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-5 h-5 text-danger-400" />
              <h3 className="font-semibold text-danger-300">Law 1: The Shield</h3>
            </div>
            <p className="text-sm text-primary-400">Inalienable individual rights</p>
            <p className="text-xs text-primary-500 mt-2">1st, 2nd, 4th, 5th, 14th Amendments</p>
          </div>
          <div className="card-elevated p-4 border-success-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Unlock className="w-5 h-5 text-success-400" />
              <h3 className="font-semibold text-success-300">Law 2: The Sandbox</h3>
            </div>
            <p className="text-sm text-primary-400">Local community logistics</p>
            <p className="text-xs text-primary-500 mt-2">Budget, zoning, public services</p>
          </div>
          <div className="card-elevated p-4 border-accent-500/30">
            <div className="flex items-center gap-3 mb-2">
              <FileCode className="w-5 h-5 text-accent-400" />
              <h3 className="font-semibold text-accent-300">Law 3: Dynamic</h3>
            </div>
            <p className="text-sm text-primary-400">Citizen write-in proposals</p>
            <p className="text-xs text-primary-500 mt-2">Other submissions by citizens</p>
          </div>
        </div>
      </div>

      {/* Protocol Rules Reference */}
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

      {/* Proposal History */}
      {proposals.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-primary-200 mb-4">Proposal History</h2>
          <div className="space-y-3">
            {proposals.map(p => (
              <div key={p.id} className="card-elevated p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-primary-200">{p.title}</h4>
                  {p.status === 'compiled' ? (
                    <span className="badge-success">Compiled</span>
                  ) : (
                    <span className="badge-danger">Vetoed</span>
                  )}
                </div>
                <p className="text-sm text-primary-400 line-clamp-2">{p.content}</p>
                {p.vetoReason && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-danger-400">
                    <AlertCircle className="w-3 h-3" />
                    {p.vetoReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
