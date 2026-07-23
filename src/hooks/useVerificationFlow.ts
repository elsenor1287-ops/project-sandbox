import { useState, useEffect, useRef } from 'react';

export type FlowStage = 'idle' | 'scanning' | 'verified';

export interface VerificationStep {
  id: number;
  pending: string;
  done: string;
  completed: boolean;
  active: boolean;
}

export const INITIAL_STEPS: VerificationStep[] = [
  { id: 1, pending: 'Awaiting Hardware Biometric Scan...', done: 'Hardware Verified', completed: false, active: false },
  { id: 2, pending: 'Verifying Local Jurisdiction Credential...', done: 'Jurisdiction Confirmed', completed: false, active: false },
  { id: 3, pending: 'Syncing Peer-Vouch Network...', done: 'Network Synced', completed: false, active: false },
];

export function useVerificationFlow() {
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


  return { stage, steps, cardVisible, welcomeVisible, startVerification };
}
