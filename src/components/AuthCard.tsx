import { Lock, Fingerprint, CheckCircle, Circle } from 'lucide-react';
import type { FlowStage, VerificationStep } from '../hooks/useVerificationFlow';

export interface AuthCardProps {
  stage: FlowStage;
  steps: VerificationStep[];
  startVerification: () => void;
}

export function AuthCard({ stage, steps, startVerification }: AuthCardProps) {
  return (
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
              {/* Card top accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700" />

              <div className="px-8 sm:px-10 py-10">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <Fingerprint className="w-7 h-7 text-slate-700" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Title */}
                <div className="text-center mb-2">
                  <p className="text-[10px] tracking-[0.25em] uppercase font-semibold text-slate-400 mb-2">
                    Project Sandbox
                  </p>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                    Civic Authentication Portal
                  </h1>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    Sovereign identity verification via zero-knowledge proof protocol.
                  </p>
                </div>

                <div className="mt-8">
                  {stage === 'idle' && (
                    <button
                      onClick={startVerification}
                      className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold text-sm tracking-wide py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-slate-900/30 group"
                    >
                      <Lock className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" strokeWidth={2} />
                      Verify Sovereign Identity (ZK-Shielded)
                    </button>
                  )}

                  {stage === 'scanning' && (
                    <div className="space-y-3 animate-in">
                      {steps.map(step => (
                        <VerificationStepRow key={step.id} step={step} />
                      ))}
                    </div>
                  )}
                </div>

                {stage === 'idle' && (
                  <p className="text-center text-[10px] text-slate-400 mt-6 tracking-wide leading-relaxed">
                    No biometric data transmitted to external servers
                  </p>
                )}
              </div>

              {/* Card bottom accent */}
              <div className="bg-slate-50 border-t border-slate-100 px-8 sm:px-10 py-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 tracking-widest uppercase font-medium">
                  ZK Protocol v2.4
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-slate-400 tracking-widest uppercase font-medium">
                    Secure Channel
                  </span>
                </div>
              </div>
            </div>

  );
}

export function VerificationStepRow({ step }: { step: VerificationStep }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-500 ${
        step.completed
          ? 'bg-emerald-50 border-emerald-200'
          : step.active
          ? 'bg-slate-50 border-slate-200'
          : 'bg-slate-50/50 border-slate-100'
      }`}
    >
      <div className="flex-shrink-0">
        {step.completed ? (
          <CheckCircle className="w-5 h-5 text-emerald-500 transition-all duration-300" strokeWidth={2} />
        ) : step.active ? (
          <div className="w-5 h-5 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
        ) : (
          <Circle className="w-5 h-5 text-slate-300" strokeWidth={1.5} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate transition-all duration-300 ${
            step.completed ? 'text-emerald-700' : step.active ? 'text-slate-700' : 'text-slate-400'
          }`}
        >
          {step.completed ? step.done : step.pending}
        </p>
      </div>
      {step.completed && (
        <span className="text-[10px] tracking-widest text-emerald-500 uppercase font-semibold flex-shrink-0">
          OK
        </span>
      )}
    </div>
  );
}
