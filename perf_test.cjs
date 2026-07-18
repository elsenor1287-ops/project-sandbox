const { performance } = require('perf_hooks');

// Mock data
const PROTOCOL_RULES = [
  {
    id: 'law1-1',
    law: 1,
    name: 'Asimov Law 1 - Harm Prevention',
    description: 'A robot may not injure a human being or, through inaction, allow a human being to come to harm.',
    keywords: ['injure', 'harm', 'kill', 'destroy', 'attack', 'damage', 'hurt', 'pain', 'suffering'],
    isProtected: true,
  },
  {
    id: 'law1-2',
    law: 1,
    name: 'Asimov Law 1 - Safety First',
    description: 'Safety protocols must override all other directives.',
    keywords: ['override safety', 'disable safety', 'bypass safety', 'ignore safety'],
    isProtected: true,
  },
  {
    id: 'law1-3',
    law: 1,
    name: 'Asimov Law 1 - Human Preservation',
    description: 'Human life and well-being must be preserved above all.',
    keywords: ['endanger', 'threaten', 'jeopardize', 'risk human'],
    isProtected: true,
  }
];

const LAW1_RULES = PROTOCOL_RULES.filter(rule => rule.law === 1);

// Original Implementation
function checkLaw1ViolationsOriginal(content) {
  const violations = [];
  const lowerContent = content.toLowerCase();

  LAW1_RULES.forEach(rule => {
    rule.keywords.forEach(keyword => {
      if (lowerContent.includes(keyword.toLowerCase())) {
        violations.push(`${rule.name}: "${keyword}" detected`);
      }
    });
  });

  return violations;
}

// Optimized Implementation
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const LAW1_KEYWORDS_FLAT = LAW1_RULES.flatMap(rule =>
  rule.keywords.map(kw => ({
    lowerKw: kw.toLowerCase(),
    originalKw: kw,
    ruleName: rule.name
  }))
);

const COMPILED_LAW1_REGEX = new RegExp(
  LAW1_KEYWORDS_FLAT.map(k => escapeRegExp(k.lowerKw)).join('|'),
  'g'
);

const LAW1_KEYWORD_MAP = new Map(LAW1_KEYWORDS_FLAT.map(k => [
  k.lowerKw,
  `${k.ruleName}: "${k.originalKw}" detected`
]));

function checkLaw1ViolationsOptimized(content) {
  const violations = [];
  const lowerContent = content.toLowerCase();

  const matches = lowerContent.match(COMPILED_LAW1_REGEX);
  if (matches) {
    const uniqueMatches = new Set(matches);
    for (const match of uniqueMatches) {
      const ruleMsg = LAW1_KEYWORD_MAP.get(match);
      if (ruleMsg) {
        violations.push(ruleMsg);
      }
    }
  }

  return violations;
}

// Optimized Implementation 2 (Aho-Corasick style but using regex)
// Using an array of compiled regexes per rule
const COMPILED_LAW1_RULES = LAW1_RULES.map(rule => {
  const pattern = rule.keywords.map(kw => escapeRegExp(kw.toLowerCase())).join('|');
  return {
    name: rule.name,
    regex: new RegExp(pattern, 'g'),
    keywordsMap: new Map(rule.keywords.map(kw => [kw.toLowerCase(), kw]))
  };
});

function checkLaw1ViolationsOptimized2(content) {
  const violations = [];
  const lowerContent = content.toLowerCase();

  COMPILED_LAW1_RULES.forEach(rule => {
    const matches = lowerContent.match(rule.regex);
    if (matches) {
      const uniqueMatches = new Set(matches);
      for (const match of uniqueMatches) {
        const originalKw = rule.keywordsMap.get(match);
        if (originalKw) {
          violations.push(`${rule.name}: "${originalKw}" detected`);
        }
      }
    }
  });

  return violations;
}

// Run benchmarks
const texts = [
  "This is a perfectly safe proposal that helps humans.",
  "This proposal will injure a human and destroy everything.",
  "We should bypass safety checks to make it faster.",
  "Just a long text that doesn't trigger anything. ".repeat(100),
  "Endanger the system by ignoring safety protocols and causing harm.".repeat(10),
];

const iterations = 10000;

function runBenchmark(name, fn) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    for (const text of texts) {
      fn(text);
    }
  }
  const end = performance.now();
  console.log(`${name}: ${(end - start).toFixed(2)}ms`);
}

// Warmup
for (let i = 0; i < 100; i++) {
  texts.forEach(checkLaw1ViolationsOriginal);
  texts.forEach(checkLaw1ViolationsOptimized);
  texts.forEach(checkLaw1ViolationsOptimized2);
}

console.log("Running benchmarks...");
runBenchmark("Original", checkLaw1ViolationsOriginal);
runBenchmark("Optimized (Single Regex)", checkLaw1ViolationsOptimized);
runBenchmark("Optimized 2 (Regex per rule)", checkLaw1ViolationsOptimized2);

// Correctness check
const testText = "This proposal will injure a human and bypass safety.";
console.log("\nCorrectness test:");
console.log("Original:", checkLaw1ViolationsOriginal(testText));
console.log("Optimized 1:", checkLaw1ViolationsOptimized(testText));
console.log("Optimized 2:", checkLaw1ViolationsOptimized2(testText));
