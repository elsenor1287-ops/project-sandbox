const { performance } = require('perf_hooks');

const INITIAL_STEPS = [
  { id: 1, pending: 'Awaiting Hardware Biometric Scan...', done: 'Hardware Verified', completed: false, active: false },
  { id: 2, pending: 'Verifying Local Jurisdiction Credential...', done: 'Jurisdiction Confirmed', completed: false, active: false },
  { id: 3, pending: 'Syncing Peer-Vouch Network...', done: 'Network Synced', completed: false, active: false },
];

const STEPS_SCANNING_START = [
  { ...INITIAL_STEPS[0], active: true },
  INITIAL_STEPS[1],
  INITIAL_STEPS[2],
];
const STEPS_STEP_1_COMPLETE = [
  { ...INITIAL_STEPS[0], completed: true, active: false },
  { ...INITIAL_STEPS[1], active: true },
  INITIAL_STEPS[2],
];
const STEPS_STEP_2_COMPLETE = [
  { ...INITIAL_STEPS[0], completed: true, active: false },
  { ...INITIAL_STEPS[1], completed: true, active: false },
  { ...INITIAL_STEPS[2], active: true },
];
const STEPS_STEP_3_COMPLETE = [
  { ...INITIAL_STEPS[0], completed: true, active: false },
  { ...INITIAL_STEPS[1], completed: true, active: false },
  { ...INITIAL_STEPS[2], completed: true, active: false },
];

function runBaseline() {
  const ITERATIONS = 100000;
  let result;
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    let steps = INITIAL_STEPS;
    steps = steps.map((s, idx) => ({ ...s, active: idx === 0 }));
    steps = steps.map((s, idx) => (idx === 0 ? { ...s, completed: true, active: false } : idx === 1 ? { ...s, active: true } : s));
    steps = steps.map((s, idx) => (idx === 1 ? { ...s, completed: true, active: false } : idx === 2 ? { ...s, active: true } : s));
    steps = steps.map(s => ({ ...s, completed: true, active: false }));
    result = steps; // prevent dead code elimination
  }
  const end = performance.now();
  return end - start;
}

function runOptimized() {
  const ITERATIONS = 100000;
  let result;
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    let steps = INITIAL_STEPS;
    steps = STEPS_SCANNING_START;
    steps = STEPS_STEP_1_COMPLETE;
    steps = STEPS_STEP_2_COMPLETE;
    steps = STEPS_STEP_3_COMPLETE;
    result = steps; // prevent dead code elimination
  }
  const end = performance.now();
  return end - start;
}

console.log('Baseline:', runBaseline().toFixed(2), 'ms');
console.log('Optimized:', runOptimized().toFixed(2), 'ms');
