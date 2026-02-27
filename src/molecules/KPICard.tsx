import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../atoms/Card';

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  iconColor: string;
  compareValue?: string;
  compareLabel?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  icon,
  iconColor,
  compareValue,
  compareLabel
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
                <TrendingUp className="w-4 h-4 text-[#cf1b22] mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#7f0c12] mr-1" />
              )}
              <span className={isPositive ? 'text-[#cf1b22]' : 'text-[#7f0c12]'}>
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-gray-600 ml-1">vs mes anterior</span>
            </div>
          )}
          {compareValue !== undefined && compareValue !== '' && (
            <p className="mt-2 text-sm text-gray-500">
              {compareLabel ? `${compareLabel}: ` : 'Comparativa: '}
              <span className="font-medium text-gray-700">{compareValue}</span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg shrink-0 ${iconColor}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
