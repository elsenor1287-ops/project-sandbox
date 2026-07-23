import { CheckCircle, ArrowRight } from 'lucide-react';

export function WelcomePanel({ onEnter }: { onEnter: () => void }) {
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
