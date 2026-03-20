import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  color = 'blue',
}: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    gray: 'bg-gray-500',
  };

  return (
    <div className="bg-white overflow-hidden rounded-lg border border-gray-200 p-6">
      <div className="flex items-center">
        <div className="flex-1">
          <div className="flex items-center">
            {Icon && (
              <div className={cn('flex items-center justify-center w-8 h-8 rounded-md', colorClasses[color])}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            )}
            <h3 className={cn('text-sm font-medium text-gray-500', Icon && 'ml-3')}>
              {title}
            </h3>
          </div>

          <div className="mt-2">
            <div className="text-3xl font-semibold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
          </div>

          {description && (
            <div className="mt-1 text-sm text-gray-600">
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
