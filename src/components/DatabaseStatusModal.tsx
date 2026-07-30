import { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, Copy, Check, Terminal, ExternalLink, X, RefreshCw } from 'lucide-react';
import { isSupabaseConfigured, supabase, SUPABASE_SQL_SETUP } from '../lib/supabase';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DatabaseStatusModal({ isOpen, onClose }: DatabaseStatusModalProps) {
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    proposalsCount?: number;
    submissionsCount?: number;
  } | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testConnection = async () => {
    if (!isSupabaseConfigured) {
      setTestResult({
        success: false,
        message: 'Supabase URL or Anon Key is not configured yet. Set VITE_SUPABASE_ANON_KEY in your env settings.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Test proposals table
      const { count: propCount, error: propError } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true });

      // Test submissions table
      const { count: subCount, error: subError } = await supabase
        .from('ballot_submissions')
        .select('*', { count: 'exact', head: true });

      if (propError || subError) {
        const errorMsg = propError?.message || subError?.message || 'Database error';
        if (errorMsg.includes('does not exist')) {
          setTestResult({
            success: false,
            message: 'Database connected, but the required tables do not exist yet. Please run the SQL setup script below in your Supabase SQL Editor!'
          });
        } else {
          setTestResult({
            success: false,
            message: `Connection failed: ${errorMsg}`
          });
        }
      } else {
        setTestResult({
          success: true,
          message: 'Connection successful! Tables verified successfully.',
          proposalsCount: propCount || 0,
          submissionsCount: subCount || 0,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setTestResult({
        success: false,
        message: `Network error or failed request: ${errorMessage}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    if (isOpen && isSupabaseConfigured) {
      testConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-primary-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fade-in">
      <div className="bg-primary-900 border border-primary-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-primary-700/50 flex items-center justify-between bg-primary-950/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isSupabaseConfigured ? 'bg-success-500/10 text-success-400' : 'bg-warning-500/10 text-warning-400'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary-100">Supabase DB Sync</h2>
              <p className="text-xs text-primary-400">Manage real-time decentralized state synchronization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-primary-800 text-primary-400 hover:text-primary-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Status Panel */}
          <div className={`card p-5 border ${isSupabaseConfigured ? 'border-success-500/20 bg-success-950/5' : 'border-warning-500/20 bg-warning-950/5'} space-y-4`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-primary-100">Integration Configuration</h3>
                <p className="text-xs text-primary-400 mt-0.5">
                  Connected endpoint: <code className="text-primary-300 font-mono text-xs break-all">https://offsicarzljenjrzfant.supabase.co</code>
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-950 border border-primary-700">
                <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-success-400 animate-pulse' : 'bg-warning-400'}`} />
                <span className={isSupabaseConfigured ? 'text-success-400' : 'text-warning-400'}>
                  {isSupabaseConfigured ? 'Configured' : 'Setup Needed'}
                </span>
              </div>
            </div>

            {/* Test connection output */}
            {testResult ? (
              <div className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${testResult.success ? 'bg-success-950/20 border-success-500/30 text-success-300' : 'bg-danger-950/20 border-danger-500/30 text-danger-300'}`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-success-400 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0 text-danger-400 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-semibold">{testResult.success ? 'Verified Connected' : 'Verification Issue'}</p>
                  <p className="text-xs leading-relaxed">{testResult.message}</p>
                  {testResult.success && (
                    <div className="flex gap-4 mt-2 font-mono text-xs text-success-400">
                      <span>Proposals in DB: {testResult.proposalsCount}</span>
                      <span>Submissions in DB: {testResult.submissionsCount}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : isSupabaseConfigured ? (
              <div className="text-xs text-primary-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                Ready to run a database handshake verification.
              </div>
            ) : null}

            {/* Actions for Status Panel */}
            <div className="flex gap-3">
              {isSupabaseConfigured ? (
                <button
                  onClick={testConnection}
                  disabled={isTesting}
                  className="btn-primary py-2 px-4 text-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? 'Verifying Tables...' : 'Verify Schema'}
                </button>
              ) : (
                <div className="text-xs text-warning-400 leading-relaxed bg-warning-500/5 p-3 rounded-xl border border-warning-500/10">
                  ⚠️ <strong>Supabase client is loaded in fallback mode.</strong> To connect your real live database, configure your <code className="text-primary-200">VITE_SUPABASE_ANON_KEY</code> env variable. Any local submissions or proposals will synchronize immediately once configured!
                </div>
              )}
            </div>
          </div>

          {/* Setup Script */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-primary-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-accent-400" />
                Database Schema SQL Script
              </label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-200 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-primary-800"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-success-400" />
                    <span className="text-success-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>
            
            <p className="text-xs text-primary-400">
              Paste this command into your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-accent-400 hover:underline inline-flex items-center gap-0.5 font-semibold">Supabase SQL Editor <ExternalLink className="w-3 h-3" /></a> to instantly create the correct tables and enable real-time read/write permissions.
            </p>

            <div className="relative">
              <pre className="p-4 bg-primary-950 border border-primary-800 rounded-xl font-mono text-xs text-primary-300 overflow-x-auto max-h-48 scrollbar-thin">
                {SUPABASE_SQL_SETUP}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-primary-700/50 bg-primary-950/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-800 hover:bg-primary-700 text-primary-200 rounded-xl text-xs font-semibold cursor-pointer transition-all"
          >
            Close Manager
          </button>
        </div>
      </div>
    </div>
  );
}
