import React from 'react';
import { BillForm } from '../organisms/BillForm';

export const NewBillPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Registrar Nueva Factura</h1>
        <p className="text-gray-600 mt-1">Ingresa los detalles de tu factura de servicios</p>
      </div>
      <BillForm />
    </div>
  );
};
