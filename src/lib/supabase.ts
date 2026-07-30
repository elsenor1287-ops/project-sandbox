import { createClient } from '@supabase/supabase-js';
import type { Proposal, BallotSubmission } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://offsicarzljenjrzfant.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Supabase client initialization. Note that the client won't work correctly
// for real API requests if the anon key is empty or default, so we check configurations.
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your_supabase_anon_key'
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'dummy-key');

export const SUPABASE_SQL_SETUP = `-- Supabase SQL Setup for Project Sandbox
-- Copy and run this script in your Supabase SQL Editor to set up the necessary tables!

-- 1. Create Proposals Table
CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tier TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL,
  veto_reason TEXT,
  triggered_keywords TEXT[]
);

-- 2. Create Ballot Submissions Table
CREATE TABLE IF NOT EXISTS ballot_submissions (
  voter_id TEXT PRIMARY KEY,
  rankings JSONB NOT NULL,
  write_in TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS) and allow public access for development
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ballot_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to proposals" ON proposals
  FOR SELECT USING (true);

CREATE POLICY "Allow public write access to proposals" ON proposals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to submissions" ON ballot_submissions
  FOR SELECT USING (true);

CREATE POLICY "Allow public write access to submissions" ON ballot_submissions
  FOR INSERT WITH CHECK (true);
`;

export async function dbFetchProposals(): Promise<Proposal[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (error) {
      console.warn('Supabase fetch proposals error:', error.message);
      return null;
    }

    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      tier: item.tier,
      submittedBy: item.submitted_by,
      submittedAt: new Date(item.submitted_at),
      status: item.status,
      vetoReason: item.veto_reason,
      triggeredKeywords: item.triggered_keywords,
    }));
  } catch (err) {
    console.error('Failed to fetch proposals:', err);
    return null;
  }
}

export async function dbInsertProposal(proposal: Proposal): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('proposals').insert([{
      id: proposal.id,
      title: proposal.title,
      content: proposal.content,
      tier: proposal.tier,
      submitted_by: proposal.submittedBy,
      submitted_at: proposal.submittedAt.toISOString(),
      status: proposal.status,
      veto_reason: proposal.vetoReason || null,
      triggered_keywords: proposal.triggeredKeywords || null,
    }]);

    if (error) {
      console.warn('Supabase insert proposal error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to insert proposal:', err);
    return false;
  }
}

export async function dbFetchBallotSubmissions(): Promise<BallotSubmission[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('ballot_submissions')
      .select('*');

    if (error) {
      console.warn('Supabase fetch ballot submissions error:', error.message);
      return null;
    }

    return (data || []).map(item => ({
      voterId: item.voter_id,
      rankings: item.rankings,
      writeIn: item.write_in,
      submittedAt: new Date(item.submitted_at),
    }));
  } catch (err) {
    console.error('Failed to fetch submissions:', err);
    return null;
  }
}

export async function dbInsertBallotSubmission(submission: BallotSubmission): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('ballot_submissions').upsert([{
      voter_id: submission.voterId,
      rankings: submission.rankings,
      write_in: submission.writeIn || null,
      submitted_at: submission.submittedAt.toISOString(),
    }]);

    if (error) {
      console.warn('Supabase insert submission error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to insert submission:', err);
    return false;
  }
}

export async function dbResetVotingSubmissions(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('ballot_submissions').delete().neq('voter_id', '');
    if (error) {
      console.warn('Supabase reset submissions error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to reset submissions:', err);
    return false;
  }
}
