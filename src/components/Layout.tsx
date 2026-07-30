import { useState } from 'react';
import { LayoutDashboard, Fingerprint, Vote, Code2, Shield, Activity, Database } from 'lucide-react';
import type { PageRoute } from '../types';
import { DatabaseStatusModal } from './DatabaseStatusModal';
import { isSupabaseConfigured } from '../lib/supabase';

interface SidebarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  identityStatus: string;
}

const navItems: { path: PageRoute; icon: React.ElementType; label: string }[] = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/identity', icon: Fingerprint, label: 'Identity Wallet' },
  { path: '/vote', icon: Vote, label: 'RCV Sandbox' },
  { path: '/compiler', icon: Code2, label: 'Proposal Compiler' },
];

export function Sidebar({ currentPage, onNavigate, identityStatus }: SidebarProps) {
  return (
    <aside className="w-64 h-screen bg-primary-900/80 backdrop-blur-xl border-r border-primary-700/50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-primary-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-success-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary-100">Sandbox</h1>
            <p className="text-xs text-primary-400">Governance Engine</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const isActive = currentPage === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full ${isActive ? 'nav-item-active' : 'nav-item'}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Status Footer */}
      <div className="p-4 border-t border-primary-700/50">
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary-400">System Status</span>
            <Activity className="w-4 h-4 text-success-400" />
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                identityStatus === 'active'
                  ? 'bg-success-400'
                  : identityStatus === 'frozen'
                  ? 'bg-danger-400'
                  : identityStatus === 'deactivated'
                  ? 'bg-danger-600'
                  : 'bg-warning-400'
              }`}
            />
            <span className="text-sm text-primary-300 capitalize">{identityStatus}</span>
          </div>
          <div className="text-xs text-primary-500">
            <p>Chain Height: 14,337,821</p>
            <p>Validator Set: 128 nodes</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function Header() {
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  return (
    <header className="h-16 bg-primary-900/50 backdrop-blur-xl border-b border-primary-700/50 flex items-center justify-between px-6">
      <div>
        <h2 className="text-sm text-primary-400">Welcome back, Citizen</h2>
        <p className="text-xs text-primary-500">CITIZEN-2024-01337</p>
      </div>
      <div className="flex items-center gap-6">
        {/* DB Sync Control */}
        <button
          onClick={() => setIsDbModalOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer select-none transition-all duration-300 ${
            isSupabaseConfigured
              ? 'bg-success-500/10 hover:bg-success-500/20 border-success-500/30 text-success-400'
              : 'bg-primary-800/80 hover:bg-primary-700 border-primary-700 text-primary-300'
          }`}
          title="Manage Supabase Sync"
        >
          <Database className="w-3.5 h-3.5" />
          <span>DB Sync</span>
          <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-success-400 animate-pulse' : 'bg-primary-500'}`} />
        </button>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-primary-300">Monthly Cycle Active</p>
            <p className="text-xs text-primary-500">Feb 1 - Feb 28, 2024</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-600 to-accent-400 flex items-center justify-center text-white font-medium">
            C
          </div>
        </div>
      </div>

      <DatabaseStatusModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
    </header>
  );
}
