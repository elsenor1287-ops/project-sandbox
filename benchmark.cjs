const { performance } = require('perf_hooks');

const ballotOptions = Array.from({ length: 1000 }, (_, i) => ({
  id: `opt-${i}`,
  title: `Option ${i}`,
  description: `Description ${i}`,
  budget: 1000,
  category: 'Test'
}));

const testAccounts = Array.from({ length: 1000 }, (_, i) => ({
  id: `acc-${i}`,
  name: `Account ${i}`
}));

const submissions = Array.from({ length: 10 }, (_, i) => ({
  voterId: `acc-${i}`,
  rankings: Array.from({ length: 100 }, (_, j) => ({
    optionId: `opt-${Math.floor(Math.random() * 1000)}`,
    rank: j + 1
  })),
  writeIn: null,
  submittedAt: new Date()
}));

// Baseline
function runBaseline() {
  const start = performance.now();
  for (let iter = 0; iter < 1000; iter++) {
    submissions.slice(-10).reverse().map((sub, idx) => {
      const voter = testAccounts.find(t => t.id === sub.voterId);
      const rankingsStr = sub.rankings.map(r => {
        const opt = ballotOptions.find(o => o.id === r.optionId);
        return `${r.rank}: ${opt?.title || 'Unknown'}`;
      }).join(' → ');
      return { voter, rankingsStr };
    });
  }
  const end = performance.now();
  return end - start;
}

// Optimized
function runOptimized() {
  const start = performance.now();
  for (let iter = 0; iter < 1000; iter++) {
    const optionsMap = new Map(ballotOptions.map(o => [o.id, o]));
    const accountsMap = new Map(testAccounts.map(t => [t.id, t]));

    submissions.slice(-10).reverse().map((sub, idx) => {
      const voter = accountsMap.get(sub.voterId);
      const rankingsStr = sub.rankings.map(r => {
        const opt = optionsMap.get(r.optionId);
        return `${r.rank}: ${opt?.title || 'Unknown'}`;
      }).join(' → ');
      return { voter, rankingsStr };
    });
  }
  const end = performance.now();
  return end - start;
}

console.log('Baseline:', runBaseline().toFixed(2), 'ms');
console.log('Optimized:', runOptimized().toFixed(2), 'ms');
