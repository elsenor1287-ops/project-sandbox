import { Lock, ShieldCheck } from 'lucide-react';
import { useVerificationFlow } from '../hooks/useVerificationFlow';
import { AuthCard } from './AuthCard';
import { WelcomePanel } from './WelcomePanel';

const SCANNING_STEP_0: VerificationStep[] = [
  { ...INITIAL_STEPS[0], active: true },
  INITIAL_STEPS[1],
  INITIAL_STEPS[2],
];

const SCANNING_STEP_1: VerificationStep[] = [
  { ...INITIAL_STEPS[0], completed: true, active: false },
  { ...INITIAL_STEPS[1], active: true },
  INITIAL_STEPS[2],
];

const SCANNING_STEP_2: VerificationStep[] = [
  { ...INITIAL_STEPS[0], completed: true, active: false },
  { ...INITIAL_STEPS[1], completed: true, active: false },
  { ...INITIAL_STEPS[2], active: true },
];

const SCANNING_STEP_3: VerificationStep[] = [
  { ...INITIAL_STEPS[0], completed: true, active: false },
  { ...INITIAL_STEPS[1], completed: true, active: false },
  { ...INITIAL_STEPS[2], completed: true, active: false },
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
    setSteps(SCANNING_STEP_0);

    // Step 1 completes at 1.5s
    scheduleTimeout(() => {
      setSteps(SCANNING_STEP_1);
    }, 1500);

    // Step 2 completes at 3s
    scheduleTimeout(() => {
      setSteps(SCANNING_STEP_2);
    }, 3000);

    // Step 3 completes at 4.5s
    scheduleTimeout(() => {
      setSteps(SCANNING_STEP_3);
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
            <AuthCard stage={stage} steps={steps} startVerification={startVerification} />
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
