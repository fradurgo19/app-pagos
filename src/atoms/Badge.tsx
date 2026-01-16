import React from 'react';
import { BillStatus } from '../types';

interface BadgeProps {
  status: BillStatus;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const statusStyles = {
    draft: 'bg-[#f1f1f1] text-[#50504f]',
    pending: 'bg-[#fdebec] text-[#cf1b22]',
    approved: 'bg-[#f7d7da] text-[#a11217]',
    overdue: 'bg-[#f3b8bc] text-[#7f0c12]',
    paid: 'bg-[#e8e8e8] text-[#50504f]'
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
