import { InstructorPerformance } from '../types';
import { Star, AlertTriangle } from 'lucide-react';

interface InstructorTableProps {
  instructors: InstructorPerformance[];
}

export function InstructorTable({ instructors }: InstructorTableProps) {
  const getScoreColor = (score: string) => {
    const num = parseFloat(score);
    if (isNaN(num)) return 'text-gray-500';
    if (num >= 4.5) return 'text-green-600';
    if (num >= 4.0) return 'text-blue-600';
    if (num >= 3.5) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: string) => {
    const num = parseFloat(score);
    if (isNaN(num)) return null;
    if (num >= 4.5) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
          <Star className="w-3 h-3" fill="currentColor" />
          Top Performer
        </span>
      );
    }
    return null;
  };

  const sortedInstructors = [...instructors].sort((a, b) => {
    const scoreA = parseFloat(a.avgScore) || 0;
    const scoreB = parseFloat(b.avgScore) || 0;
    return scoreB - scoreA;
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Instructor</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Observations</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Avg Score</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Errors</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Satisfaction</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Badge</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedInstructors.map((instructor, index) => (
            <tr key={instructor.name} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-200 text-gray-700' :
                  index === 2 ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {index + 1}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm font-medium text-gray-900">{instructor.name}</span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-sm text-gray-700">{instructor.observations}</span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`text-sm font-semibold ${getScoreColor(instructor.avgScore)}`}>
                  {instructor.avgScore}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`text-sm ${parseInt(instructor.errors.toString()) > 0 ? 'text-red-600 font-medium' : 'text-green-600'}`}>
                  {instructor.errors > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {instructor.errors}
                    </span>
                  ) : (
                    '0'
                  )}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`text-sm font-medium ${getScoreColor(instructor.satisfaction)}`}>
                  {instructor.satisfaction}
                </span>
              </td>
              <td className="px-4 py-3">
                {getScoreBadge(instructor.avgScore)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
