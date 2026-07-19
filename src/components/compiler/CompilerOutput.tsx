import { Code2, FileCode, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import type { Proposal } from '../../types';
import { getTierInfo, highlightViolations } from './utils';

interface CompilerOutputProps {
  compileResult: {
    success: boolean;
    violations: string[];
    proposal?: Proposal;
  } | null;
  content: string;
}

export function CompilerOutput({ compileResult, content }: CompilerOutputProps) {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-primary-200 mb-4 flex items-center gap-2">
        <FileCode className="w-5 h-5" />
        Compiler Output
      </h2>

      {!compileResult ? (
        <div className="text-center py-16 text-primary-500">
          <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Compile a proposal to see results</p>
        </div>
      ) : compileResult.success ? (
        <div className="animate-in">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-8 h-8 text-success-400" />
            <div>
              <h3 className="text-lg font-semibold text-success-400">Compilation Successful</h3>
              <p className="text-sm text-primary-400">Proposal compiled and ready for ballot</p>
            </div>
          </div>

          <div className="card-elevated p-4 space-y-3">
            <div>
              <span className="text-xs text-primary-500">Proposal ID</span>
              <p className="font-mono text-primary-300">{compileResult.proposal?.id}</p>
            </div>
            <div>
              <span className="text-xs text-primary-500">Title</span>
              <p className="text-primary-200">{compileResult.proposal?.title}</p>
            </div>
            <div>
              <span className="text-xs text-primary-500">Tier</span>
              <p className="text-primary-200">
                {getTierInfo(compileResult.proposal?.tier || '').label}
              </p>
            </div>
            <div>
              <span className="text-xs text-primary-500">Status</span>
              <span className="badge-success ml-2">Ballot Ready</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="w-8 h-8 text-danger-400" />
            <div>
              <h3 className="text-lg font-semibold text-danger-400">Compilation Failed</h3>
              <p className="text-sm text-primary-400">Proposal vetoed by Law 1 Shield</p>
            </div>
          </div>

          <div className="card-elevated p-4 space-y-4 border-danger-500/30">
            <div>
              <span className="text-xs text-primary-500">Veto Reason</span>
              <div className="mt-2 space-y-2">
                {compileResult.violations.map((v, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-danger-400 mt-0.5" />
                    <span className="text-danger-300 text-sm">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs text-primary-500">Violating Content</span>
              <div className="mt-2 p-3 bg-danger-500/10 rounded-lg font-mono text-sm text-primary-300">
                {highlightViolations(content, compileResult.violations)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
