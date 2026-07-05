// Core Types for Project Sandbox Governance Engine

// ID Layer Types
export type VerificationStep = 'passport' | 'utility' | 'vouching' | 'complete';

export interface VouchToken {
  id: string;
  neighborName: string;
  neighborAddress: string;
  signedAt: Date;
  isValid: boolean;
}

export interface IdentityState {
  citizenId: string;
  status: 'active' | 'frozen' | 'deactivated' | 'pending';
  verificationStep: VerificationStep;
  passportVerified: boolean;
  utilityVerified: boolean;
  vouchTokens: VouchToken[];
  fraudStrikes: number;
  isVouchingFor: string[];
  createdAt: Date;
  frozenAt?: Date;
  frozenReason?: string;
}

// Governance Types - Asimov's Laws
export type GovernanceTier = 'law1_shield' | 'law2_sandbox' | 'law3_dynamic';

export interface ProtocolRule {
  id: string;
  law: 1 | 2 | 3;
  name: string;
  description: string;
  keywords: string[];
  isProtected: boolean;
}

export interface Proposal {
  id: string;
  title: string;
  content: string;
  tier: GovernanceTier;
  submittedBy: string;
  submittedAt: Date;
  status: 'draft' | 'compiled' | 'vetoed' | 'ballot_ready';
  vetoReason?: string;
  triggeredKeywords?: string[];
}

// RCV Types
export interface BallotOption {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: 'infrastructure' | 'education' | 'safety' | 'environment' | 'other';
  voteCount: number;
  isWriteIn: boolean;
  writeInCount?: number;
}

export interface RankedVote {
  optionId: string;
  rank: number;
}

export interface BallotSubmission {
  voterId: string;
  rankings: RankedVote[];
  writeIn?: string;
  submittedAt: Date;
}

export interface RCVRound {
  roundNumber: number;
  eliminatedOptionId?: string;
  voteDistribution: Record<string, number>;
  threshold: number;
  winner?: string;
  totalVotes: number;
}

export interface RCVResult {
  rounds: RCVRound[];
  winner: BallotOption;
  totalVotes: number;
  completedAt: Date;
}

// Mock Test Account
export interface TestAccount {
  id: string;
  name: string;
  isBot: boolean;
  hasVoted: boolean;
  writeIns: string[];
}

// Navigation
export type PageRoute = '/dashboard' | '/identity' | '/vote' | '/compiler';

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'voting' | 'proposal' | 'result' | 'meeting';
}

// Global App State
export interface AppState {
  currentPage: PageRoute;
  identity: IdentityState;
  proposals: Proposal[];
  ballotOptions: BallotOption[];
  ballotSubmissions: BallotSubmission[];
  testAccounts: TestAccount[];
  rcvResult: RCVResult | null;
  calendarEvents: CalendarEvent[];
}
