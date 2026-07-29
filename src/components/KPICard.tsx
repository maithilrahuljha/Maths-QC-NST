import { TrendingUp, TrendingDown, Minus, Target, AlertTriangle } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  target?: number;
  suffix?: string;
  lowerIsBetter?: boolean;
  icon?: React.ReactNode;
  status?: 'success' | 'warning' | 'danger' | 'neutral';
}

export function KPICard({
  title,
  value,
  change,
  target,
  suffix = '',
  lowerIsBetter = false,
  icon,
  status
}: KPICardProps) {
  const getChangeColor = () => {
    if (change === undefined || change === 0) return 'text-gray-500';
    const isPositive = lowerIsBetter ? change < 0 : change > 0;
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'danger': return 'bg-red-50 border-red-200';
      default: return 'bg-white border-gray-200';
    }
  };

  const getStatusBadgeColor = () => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-amber-100 text-amber-800';
      case 'danger': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TrendIcon = () => {
    if (change === undefined || change === 0) {
      return <Minus className="w-4 h-4 text-gray-400" />;
    }
    const isUp = change > 0;
    return isUp ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  };

  return (
    <div className={`rounded-xl border-2 p-5 shadow-sm hover:shadow-md transition-shadow ${getStatusColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {suffix && <span className="text-lg text-gray-500">{suffix}</span>}
          </div>
        </div>
        {icon && (
          <div className={`p-2 rounded-lg ${getStatusBadgeColor()}`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor()}`}>
            <TrendIcon />
            <span>{Math.abs(change).toFixed(1)}%</span>
            <span className="text-gray-500 font-normal ml-1">vs last week</span>
          </div>
        )}
        
        {target !== undefined && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Target className="w-3 h-3" />
            <span>Target: {target}{suffix}</span>
          </div>
        )}
      </div>
      
      {status === 'danger' && (
        <div className="mt-3 flex items-center gap-1 text-xs text-red-600 font-medium">
          <AlertTriangle className="w-3 h-3" />
          <span>Needs attention</span>
        </div>
      )}
    </div>
  );
}
