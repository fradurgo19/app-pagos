import React from 'react';
import { BillStatus } from '../types';

interface BadgeProps {
  status: BillStatus;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const statusStyles = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    paid: 'bg-blue-100 text-blue-800'
  };

  const statusLabels = {
    draft: 'Borrador',
    pending: 'Pendiente',
    approved: 'Aprobado',
    overdue: 'Vencido',
    paid: 'Pagado'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]} ${className}`}>
      {statusLabels[status]}
    </span>
  );
};
