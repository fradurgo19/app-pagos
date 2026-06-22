import React from 'react';
import { AlertCircle } from 'lucide-react';
import { SUNSET_APP_URL } from '../config';

export const AuthDisabledScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#cf1b22] via-[#a11217] to-[#50504f] flex items-center justify-center p-4">
    <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-amber-100 p-4 rounded-xl">
          <AlertCircle className="w-10 h-10 text-amber-700" aria-hidden="true" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Aplicación provisional desactivada</h1>
      <p className="text-gray-600 mb-6">
        Esta aplicación ya no está disponible. Utilice la nueva plataforma de gestión de facturas.
      </p>
      {SUNSET_APP_URL ? (
        <a
          href={SUNSET_APP_URL}
          className="inline-block px-6 py-3 bg-[#cf1b22] hover:bg-[#a11217] text-white rounded-xl font-medium transition-colors"
        >
          Ir a la nueva aplicación
        </a>
      ) : (
        <p className="text-sm text-gray-500">
          Contacte al administrador para obtener la URL de la nueva aplicación.
        </p>
      )}
    </div>
  </div>
);
