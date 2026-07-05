import type { BallotOption, ProtocolRule, TestAccount, CalendarEvent, VouchToken, IdentityState } from '../types';

// Asimov's Three Laws of Governance
export const PROTOCOL_RULES: ProtocolRule[] = [
  // Law 1: The Shield - Inalienable Rights
  {
    id: 'shield-1',
    law: 1,
    name: 'First Amendment Shield',
    description: 'Congress shall make no law abridging freedom of speech, press, or assembly',
    keywords: ['ban speech', 'censor', 'silence', 'prohibit expression', 'restrict press', 'ban protest'],
    isProtected: true,
  },
  {
    id: 'shield-2',
    law: 1,
    name: 'Second Amendment Shield',
    description: 'The right of the people to keep and bear Arms shall not be infringed',
    keywords: ['seize weapons', 'confiscate guns', 'ban firearms', 'prohibit arms', 'disarm citizens'],
    isProtected: true,
  },
  {
    id: 'shield-3',
    law: 1,
    name: 'Fourth Amendment Shield',
    description: 'The right of the people to be secure in their persons, houses, papers, and effects against unreasonable searches',
    keywords: ['unreasonable search', 'warrantless entry', 'seize property', 'confiscate without'],
    isProtected: true,
  },
  {
    id: 'shield-4',
    law: 1,
    name: 'Fifth Amendment Shield',
    description: 'No person shall be deprived of life, liberty, or property without due process of law',
    keywords: ['without due process', 'no trial', 'summary punishment', 'property without compensation', 'confiscate property without pay'],
    isProtected: true,
  },
  {
    id: 'shield-5',
    law: 1,
    name: 'Fourteenth Amendment Shield',
    description: 'No state shall deny any person equal protection of the laws',
    keywords: ['discriminate against', 'deny rights to', 'separate but', 'unequal treatment'],
    isProtected: true,
  },
  // Law 2: The Sandbox - Local Community Logistics
  {
    id: 'sandbox-1',
    law: 2,
    name: 'Local Budget Allocation',
    description: 'Community decisions regarding local budget distribution and resource allocation',
    keywords: [],
    isProtected: false,
  },
  {
    id: 'sandbox-2',
    law: 2,
    name: 'Zoning and Land Use',
    description: 'Local decisions on community development and land utilization',
    keywords: [],
    isProtected: false,
  },
  {
    id: 'sandbox-3',
    law: 2,
    name: 'Public Services',
    description: 'Community decisions on local public service offerings',
    keywords: [],
    isProtected: false,
  },
  // Law 3: The Dynamic Other
  {
    id: 'dynamic-1',
    law: 3,
    name: 'Write-In Submissions',
    description: 'Citizen-initiated proposals through write-in process',
    keywords: [],
    isProtected: false,
  },
];

export const INITIAL_BALLOT_OPTIONS: BallotOption[] = [
  {
    id: 'opt-1',
    title: 'Riverside Park Renovation',
    description: 'Complete renovation of Riverside Park including new playground, walking trails, and community garden',
    budget: 2500000,
    category: 'environment',
    voteCount: 0,
    isWriteIn: false,
  },
  {
    id: 'opt-2',
    title: 'Main Street Infrastructure',
    description: 'Road resurfacing, new sidewalks, and smart traffic signals for Main Street corridor',
    budget: 3200000,
    category: 'infrastructure',
    voteCount: 0,
    isWriteIn: false,
  },
  {
    id: 'opt-3',
    title: 'Community Technology Hub',
    description: 'Build a new community center with free computer access, coding classes, and maker space',
    budget: 1500000,
    category: 'education',
    voteCount: 0,
    isWriteIn: false,
  },
  {
    id: 'opt-4',
    title: 'Neighborhood Watch Expansion',
    description: 'Expand neighborhood watch program with 50 new cameras and community patrol training',
    budget: 800000,
    category: 'safety',
    voteCount: 0,
    isWriteIn: false,
  },
  {
    id: 'opt-5',
    title: 'Solar Panel Initiative',
    description: 'Install solar panels on all municipal buildings with community rebate program',
    budget: 4500000,
    category: 'environment',
    voteCount: 0,
    isWriteIn: false,
  },
  {
    id: 'opt-6',
    title: 'Youth After-School Program',
    description: 'Free after-school program for 500 students with tutoring, sports, and arts',
    budget: 750000,
    category: 'education',
    voteCount: 0,
    isWriteIn: false,
  },
];

export const MOCK_TEST_ACCOUNTS: TestAccount[] = [
  { id: 'test-1', name: 'Sarah Chen', isBot: true, hasVoted: false, writeIns: [] },
  { id: 'test-2', name: 'Michael Rodriguez', isBot: true, hasVoted: false, writeIns: [] },
  { id: 'test-3', name: 'Emily Watson', isBot: true, hasVoted: false, writeIns: [] },
  { id: 'test-4', name: 'James Park', isBot: true, hasVoted: false, writeIns: [] },
  { id: 'test-5', name: 'Linda Thompson', isBot: true, hasVoted: false, writeIns: [] },
  { id: 'test-6', name: 'David Kim', isBot: true, hasVoted: false, writeIns: [] },
  { id: 'test-7', name: 'Maria Garcia', isBot: true, hasVoted: false, writeIns: [] },
  { id: 'test-8', name: 'Robert Johnson', isBot: true, hasVoted: false, writeIns: [] },
  { id: 'test-9', name: 'Jennifer Lee', isBot: true, hasVoted: false, writeIns: [] },
  { id: 'test-10', name: 'William Brown', isBot: true, hasVoted: false, writeIns: [] },
];

export const MOCK_VOUCH_TOKENS: VouchToken[] = [
  {
    id: 'vouch-1',
    neighborName: 'Thomas Anderson',
    neighborAddress: '456 Oak Street',
    signedAt: new Date('2024-01-15'),
    isValid: true,
  },
  {
    id: 'vouch-2',
    neighborName: 'Morpheus Williams',
    neighborAddress: '123 Matrix Lane',
    signedAt: new Date('2024-01-16'),
    isValid: true,
  },
  {
    id: 'vouch-3',
    neighborName: 'Trinity Johnson',
    neighborAddress: '789 Nebuchadnezzar Ave',
    signedAt: new Date('2024-01-17'),
    isValid: true,
  },
];

export const INITIAL_IDENTITY: IdentityState = {
  citizenId: 'CITIZEN-2024-01337',
  status: 'pending',
  verificationStep: 'passport',
  passportVerified: false,
  utilityVerified: false,
  vouchTokens: [],
  fraudStrikes: 0,
  isVouchingFor: [],
  createdAt: new Date('2024-01-01'),
};

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'RCV Ballot Opens',
    date: new Date('2024-02-01'),
    type: 'voting',
  },
  {
    id: 'event-2',
    title: 'Proposal Deadline',
    date: new Date('2024-02-15'),
    type: 'proposal',
  },
  {
    id: 'event-3',
    title: 'Community Meeting',
    date: new Date('2024-02-20'),
    type: 'meeting',
  },
  {
    id: 'event-4',
    title: 'RCV Results Announced',
    date: new Date('2024-02-28'),
    type: 'result',
  },
];

// Veto responses for the compiler
export const VETO_RESPONSES: Record<string, string> = {
  'ban speech': 'First Amendment violation: Citizens cannot be silenced',
  'censor': 'First Amendment violation: Press and speech censorship prohibited',
  'seize weapons': 'Second Amendment violation: Firearm confiscation blocked',
  'confiscate guns': 'Second Amendment violation: Arms cannot be confiscated',
  'without due process': 'Fifth Amendment violation: Due process is mandatory',
  'confiscate property without pay': 'Fifth Amendment violation: Just compensation required',
  'warrantless entry': 'Fourth Amendment violation: Search warrant required',
  'discriminate against': 'Fourteenth Amendment violation: Equal protection required',
};
