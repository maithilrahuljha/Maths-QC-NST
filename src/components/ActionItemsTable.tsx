import { Clock, AlertTriangle, CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { ActionItem } from '../types';
import { format, parseISO } from 'date-fns';

interface ActionItemsTableProps {
  actions: ActionItem[];
  onViewDetails?: (action: ActionItem) => void;
}

export function ActionItemsTable({ actions, onViewDetails }: ActionItemsTableProps) {
  const getSeverityStyles = (severity: ActionItem['severity']) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  if (actions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No Open Action Items</p>
        <p className="text-gray-400 text-sm mt-1">Great work! All issues have been resolved.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Severity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {actions.map((action, index) => (
              <tr 
                key={action.issueId}
                className={`hover:bg-gray-50 transition-colors ${action.isOverdue ? 'bg-red-50/50' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-sm font-medium text-gray-900">{action.issueId}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityStyles(action.severity)}`}>
                    {action.severity === 'Critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {action.severity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-900 max-w-xs truncate" title={action.description}>
                    {action.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{action.issueType}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">{action.assignedTo}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {action.isOverdue && <AlertTriangle className="w-3 h-3 text-red-500" />}
                    <span className={`text-sm ${action.isOverdue ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                      {format(parseISO(action.targetDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {action.isOverdue && (
                    <span className="text-xs text-red-500">Overdue</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(action.status)}
                    <span className="text-sm text-gray-700">{action.status}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onViewDetails?.(action)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
