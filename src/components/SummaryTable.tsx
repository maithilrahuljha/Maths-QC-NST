import { DashboardSummary } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SummaryTableProps {
  summary: DashboardSummary[];
}

export function SummaryTable({ summary }: SummaryTableProps) {
  const getTrendIcon = (icon: string) => {
    switch (icon) {
      case '↑':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case '↓':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChangeColor = (change: string) => {
    if (change.startsWith('+')) return 'text-green-600';
    if (change.startsWith('-')) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <th className="px-4 py-3 text-left text-sm font-semibold">Metric</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Current Week</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Last Week</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Change</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Target</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Trend</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {summary.map((row, index) => (
            <tr 
              key={index}
              className="hover:bg-blue-50/50 transition-colors"
            >
              <td className="px-4 py-3">
                <span className="text-sm font-medium text-gray-900">{row.metric}</span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-sm font-semibold text-gray-900">{row.currentWeek}</span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-sm text-gray-600">{row.lastWeek}</span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`text-sm font-medium ${getChangeColor(row.changePercent)}`}>
                  {row.changePercent}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-sm text-gray-600">{row.target}</span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-lg">{row.status}</span>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center">
                  {getTrendIcon(row.trendIcon)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
