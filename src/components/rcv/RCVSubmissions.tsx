import type { BallotSubmission, BallotOption, TestAccount } from '../../types';

interface RCVSubmissionsProps {
  submissions: BallotSubmission[];
  testAccountsMap: Map<string, TestAccount>;
  ballotOptionsMap: Map<string, BallotOption>;
  accountsMap: Map<string, TestAccount>;
  optionsMap: Map<string, BallotOption>;
}

export function RCVSubmissions({
  submissions,
  testAccountsMap,
  ballotOptionsMap,
  accountsMap,
  optionsMap,
}: RCVSubmissionsProps) {
  if (submissions.length === 0) return null;

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-primary-200 mb-4 flex items-center justify-between">
        <span>Recent Ballot Submissions</span>
        <span className="text-sm text-primary-400">{submissions.length} total</span>
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-primary-400 border-b border-primary-700">
              <th className="pb-3 font-medium">Voter</th>
              <th className="pb-3 font-medium">Rankings</th>
              <th className="pb-3 font-medium">Write-In</th>
              <th className="pb-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {submissions.slice(-10).reverse().map((sub, idx) => {
              const voter = testAccountsMap.get(sub.voterId) ?? accountsMap.get(sub.voterId);
              return (
                <tr key={idx} className="border-b border-primary-700/50">
                  <td className="py-3 text-primary-200">
                    {voter?.name || 'You'}
                  </td>
                  <td className="py-3 text-primary-300">
                    {(() => {
                      const sorted = [...sub.rankings].sort((a, b) => a.rank - b.rank);
                      let result = '';
                      for (let i = 0; i < sorted.length; i++) {
                        const r = sorted[i];
                        const opt = ballotOptionsMap.get(r.optionId) ?? optionsMap.get(r.optionId);
                        if (i > 0) result += ' → ';
                        result += `${r.rank}: ${opt?.title || 'Unknown'}`;
                      }
                      return result;
                    })()}
                  </td>
                  <td className="py-3 text-primary-400">
                    {sub.writeIn || '-'}
                  </td>
                  <td className="py-3 text-primary-500">
                    {sub.submittedAt.toLocaleTimeString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
