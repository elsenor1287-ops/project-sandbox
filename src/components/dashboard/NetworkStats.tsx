export function NetworkStats() {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-primary-200 mb-4">Network Status</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-400">Active Validators</span>
          <span className="text-success-400 font-medium">128/128</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-400">Avg Block Time</span>
          <span className="text-primary-200">2.4s</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-400">TPS</span>
          <span className="text-primary-200">12,847</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-400">Fees Today</span>
          <span className="text-primary-200">$0.00012 avg</span>
        </div>
        <div className="pt-3 border-t border-primary-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success-400 animate-pulse" />
            <span className="text-sm text-success-400">All Systems Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
