import { Shield, Lock, Unlock, FileCode } from 'lucide-react';

export function AsimovLawsOverview() {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-primary-200 mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5" />
        Asimov's Three Laws of Governance
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="card-elevated p-4 border-danger-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-5 h-5 text-danger-400" />
            <h3 className="font-semibold text-danger-300">Law 1: The Shield</h3>
          </div>
          <p className="text-sm text-primary-400">Inalienable individual rights</p>
          <p className="text-xs text-primary-500 mt-2">1st, 2nd, 4th, 5th, 14th Amendments</p>
        </div>
        <div className="card-elevated p-4 border-success-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Unlock className="w-5 h-5 text-success-400" />
            <h3 className="font-semibold text-success-300">Law 2: The Sandbox</h3>
          </div>
          <p className="text-sm text-primary-400">Local community logistics</p>
          <p className="text-xs text-primary-500 mt-2">Budget, zoning, public services</p>
        </div>
        <div className="card-elevated p-4 border-accent-500/30">
          <div className="flex items-center gap-3 mb-2">
            <FileCode className="w-5 h-5 text-accent-400" />
            <h3 className="font-semibold text-accent-300">Law 3: Dynamic</h3>
          </div>
          <p className="text-sm text-primary-400">Citizen write-in proposals</p>
          <p className="text-xs text-primary-500 mt-2">Other submissions by citizens</p>
        </div>
      </div>
    </div>
  );
}
