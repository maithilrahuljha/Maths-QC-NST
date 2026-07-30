import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { Alert } from '../types';
import { safeFormatDistance } from '../utils/safeDate';

interface AlertsPanelProps {
  alerts: Alert[];
  onDismiss?: (index: number) => void;
}

export function AlertsPanel({ alerts, onDismiss }: AlertsPanelProps) {
  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          text: 'text-red-800',
          badge: 'bg-red-100 text-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
          text: 'text-amber-800',
          badge: 'bg-amber-100 text-amber-700'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          text: 'text-blue-800',
          badge: 'bg-blue-100 text-blue-700'
        };
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-green-800 font-medium">All Systems Normal</p>
        <p className="text-green-600 text-sm mt-1">No active alerts at this time</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => {
        const styles = getAlertStyles(alert.type);
        return (
          <div
            key={index}
            className={`${styles.bg} ${styles.border} border rounded-lg p-4 flex items-start gap-3`}
          >
            <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${styles.badge}`}>
                  {alert.category}
                </span>
                <span className="text-xs text-gray-500">
                  {safeFormatDistance(alert.timestamp)}
                </span>
              </div>
              <p className={`text-sm ${styles.text}`}>{alert.message}</p>
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(index)}
                className="flex-shrink-0 p-1 rounded hover:bg-white/50 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
