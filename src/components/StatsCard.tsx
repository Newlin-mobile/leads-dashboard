import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  icon?: LucideIcon;
  description?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  children?: ReactNode;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  description,
  color = 'blue',
  children 
}: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500', 
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    gray: 'bg-gray-500',
  };

  const changeColorClasses = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-600',
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
          
          <div className="mt-2 flex items-baseline">
            <div className="text-3xl font-semibold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            
            {change && (
              <div className={cn('ml-2 flex items-center text-sm', changeColorClasses[change.type])}>
                <span>
                  {change.type === 'increase' && '+'}
                  {change.type === 'decrease' && '-'}
                  {change.value}
                </span>
                {change.period && (
                  <span className="ml-1 text-gray-500">
                    {change.period}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {description && (
            <div className="mt-1 text-sm text-gray-600">
              {description}
            </div>
          )}
        </div>
      </div>
      
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}

// Preset stat cards for common metrics
export function ProjectsStatsCard({ count, change }: { count: number; change?: StatsCardProps['change'] }) {
  return (
    <StatsCard
      title="Total Projects"
      value={count}
      change={change}
      color="purple"
      description="Active projects in your account"
    />
  );
}

export function ActiveUsersStatsCard({ count, change }: { count: number; change?: StatsCardProps['change'] }) {
  return (
    <StatsCard
      title="Active Users"
      value={count}
      change={change}
      color="green"
      description="Users active in the last 30 days"
    />
  );
}

export function RevenueStatsCard({ amount, change }: { amount: string; change?: StatsCardProps['change'] }) {
  return (
    <StatsCard
      title="Revenue"
      value={amount}
      change={change}
      color="blue"
      description="Monthly recurring revenue"
    />
  );
}

export function UptimeStatsCard({ percentage }: { percentage: number }) {
  return (
    <StatsCard
      title="Uptime"
      value={`${percentage.toFixed(2)}%`}
      color={percentage > 99 ? 'green' : percentage > 95 ? 'yellow' : 'red'}
      description="Service availability this month"
    />
  );
}