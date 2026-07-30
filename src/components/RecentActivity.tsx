import { RecentActivity } from '../types';
import { safeFormatDistance } from '../utils/safeDate';

interface RecentActivityListProps {
  activities: RecentActivity[];
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  const getActivityStyles = (type: string) => {
    switch (type) {
      case 'observation':
        return 'bg-blue-100 text-blue-600';
      case 'assessment':
        return 'bg-purple-100 text-purple-600';
      case 'action':
        return 'bg-amber-100 text-amber-600';
      case 'feedback':
        return 'bg-green-100 text-green-600';
      case 'research':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div
          key={index}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getActivityStyles(activity.type)}`}>
            <span className="text-lg">{activity.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
              {activity.description}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {safeFormatDistance(activity.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
