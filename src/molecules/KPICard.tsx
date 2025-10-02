import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../atoms/Card';

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  iconColor: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  icon,
  iconColor
}) => {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center text-sm">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              )}
              <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-gray-600 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconColor}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
