import { useState, useEffect, useRef } from 'react';
import { Lock, CheckCircle, Circle, ShieldCheck, ArrowRight, Fingerprint } from 'lucide-react';

type FlowStage = 'idle' | 'scanning' | 'verified';

interface VerificationStep {
  id: number;
  pending: string;
  done: string;
  completed: boolean;
  active: boolean;
}

const INITIAL_STEPS: VerificationStep[] = [
  { id: 1, pending: 'Awaiting Hardware Biometric Scan...', done: 'Hardware Verified', completed: false, active: false },
  { id: 2, pending: 'Verifying Local Jurisdiction Credential...', done: 'Jurisdiction Confirmed', completed: false, active: false },
  { id: 3, pending: 'Syncing Peer-Vouch Network...', done: 'Network Synced', completed: false, active: false },
];

interface LandingPageProps {
  onEnterDashboard: () => void;
}

export function LandingPage({ onEnterDashboard }: LandingPageProps) {
  const [stage, setStage] = useState<FlowStage>('idle');
  const [steps, setSteps] = useState<VerificationStep[]>(INITIAL_STEPS);
  const [cardVisible, setCardVisible] = useState(true);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const scheduleTimeout = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
  };

  const startVerification = () => {
    setStage('scanning');
    setSteps(prev => prev.map((s, i) => ({ ...s, active: i === 0 })));

    // Step 1 completes at 1.5s
    scheduleTimeout(() => {
      setSteps(prev =>
        prev.map((s, i) => (i === 0 ? { ...s, completed: true, active: false } : i === 1 ? { ...s, active: true } : s))
      );
    }, 1500);

    // Step 2 completes at 3s
    scheduleTimeout(() => {
      setSteps(prev =>
        prev.map((s, i) => (i === 1 ? { ...s, completed: true, active: false } : i === 2 ? { ...s, active: true } : s))
      );
    }, 3000);

    // Step 3 completes at 4.5s
    scheduleTimeout(() => {
      setSteps(prev => prev.map(s => ({ ...s, completed: true, active: false })));
    }, 4500);

    // Card fades out at 5.2s, welcome fades in
    scheduleTimeout(() => {
      setCardVisible(false);
      scheduleTimeout(() => {
        setStage('verified');
        setWelcomeVisible(true);
      }, 500);
    }, 5200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 flex flex-col relative overflow-hidden">
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded border border-slate-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-slate-300" strokeWidth={1.5} />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-[0.3em] text-slate-200 uppercase">
            Sandbox Protocol
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="text-[10px] tracking-widest uppercase font-medium hidden sm:inline">
            E2E ZK Encrypted
          </span>
        </div>
      </header>

      {/* Thin separator */}
      <div className="relative z-10 mx-6 sm:mx-10 h-px bg-slate-800" />

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        {/* Auth Card */}
        <div
          className={`transition-all duration-500 ${
            cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none absolute'
          }`}
        >
          {stage !== 'verified' && (
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
          )}
        </div>

        {/* Welcome state */}
        <div
          className={`transition-all duration-700 text-center ${
            welcomeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none absolute'
          }`}
        >
          <WelcomePanel onEnter={onEnterDashboard} />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center px-6 pb-6 pt-2">
        <p className="text-[11px] text-slate-600 leading-relaxed max-w-lg mx-auto tracking-wide">
          This portal utilizes Zero-Knowledge (ZK) Cryptography. No biometric data or personal identifiers
          are stored on external servers.
        </p>
      </footer>
    </div>
  );
}

function VerificationStepRow({ step }: { step: VerificationStep }) {
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

function WelcomePanel({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="max-w-sm mx-auto">
      {/* Green check seal */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
          </div>
          <div className="absolute inset-0 rounded-full bg-emerald-500/5 animate-ping" />
        </div>
      </div>

      <p className="text-xs tracking-[0.3em] uppercase text-slate-500 font-semibold mb-3">
        Verification Complete
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight mb-2">
        Identity Verified.
      </h2>
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-300 tracking-tight leading-tight mb-8">
        Welcome to the Sandbox.
      </h2>

      <button
        onClick={onEnter}
        className="group inline-flex items-center gap-3 bg-white text-slate-900 hover:bg-slate-100 active:bg-slate-200 font-semibold text-sm tracking-wide px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-black/30"
      >
        Enter Voting Dashboard
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" strokeWidth={2} />
      </button>

      <p className="mt-6 text-xs text-slate-600 tracking-widest uppercase">
        Session secured · ZK Proof Active
      </p>
    </div>
  );
}
