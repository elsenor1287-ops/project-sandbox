import { Clock } from 'lucide-react';

interface DashboardHeaderProps {
  currentCycleName: string;
}

export function DashboardHeader({ currentCycleName }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Governance Dashboard</h1>
        <p className="text-primary-400 mt-1">Real-time overview of Project Sandbox</p>
      </div>
      <div className="flex items-center gap-3 bg-primary-800/50 px-4 py-2 rounded-lg border border-primary-700">
        <Clock className="w-5 h-5 text-primary-400" />
        <div>
          <p className="text-sm text-primary-300">Current Cycle</p>
          <p className="text-xs text-primary-500">{currentCycleName}</p>
        </div>
      </div>
    </div>
  );
}
