import React from 'react';
import { BillForm } from '../organisms/BillForm';

export const NewBillPage: React.FC = () => {
  return (
    <div className="animate-fadeIn">
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 rounded-2xl shadow-2xl p-8 mb-6 border border-blue-700/50">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Registrar Nueva Factura</h1>
        <p className="text-blue-200 text-lg">Complete el formulario para registrar una nueva factura de servicios</p>
      </div>
      <BillForm />
    </div>
  );
};
