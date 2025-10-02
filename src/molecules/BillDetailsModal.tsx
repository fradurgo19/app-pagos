import React from 'react';
import { X, Download, Calendar, MapPin, DollarSign, FileText, User } from 'lucide-react';
import { UtilityBill } from '../types';
import { formatCurrency, formatDate, translateServiceType } from '../utils/formatters';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';

interface BillDetailsModalProps {
  bill: UtilityBill;
  onClose: () => void;
}

export const BillDetailsModal: React.FC<BillDetailsModalProps> = ({ bill, onClose }) => {
  // Debug: Ver qué datos tiene el bill
  console.log('🔍 Bill completo en modal:', bill);
  console.log('🔍 dueDate específicamente:', bill.dueDate);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Detalles de la Factura</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Estado y Período */}
          <div className="flex items-center justify-between">
            <div>
              <Badge status={bill.status} className="text-sm" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Período</p>
              <p className="text-lg font-semibold text-gray-900">{bill.period}</p>
            </div>
          </div>

          {/* Información Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo de Servicio */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo de Servicio</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {translateServiceType(bill.serviceType)}
                  </p>
                </div>
              </div>
            </div>

            {/* Proveedor */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Proveedor</p>
                  <p className="text-lg font-semibold text-gray-900">{bill.provider || '-'}</p>
                </div>
              </div>
            </div>

            {/* Monto Total */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monto Total</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(bill.totalAmount)}</p>
                </div>
              </div>
            </div>

            {/* Fecha de Vencimiento */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de Vencimiento</p>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(bill.dueDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles Adicionales */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Número de Factura</p>
                <p className="font-medium text-gray-900">{bill.invoiceNumber || '-'}</p>
              </div>
              <div>
                <p className="text-gray-600">Ubicación</p>
                <p className="font-medium text-gray-900">{bill.location}</p>
              </div>
              <div>
                <p className="text-gray-600">Centro de Costos</p>
                <p className="font-medium text-gray-900">{bill.costCenter || '-'}</p>
              </div>
              <div>
                <p className="text-gray-600">Monto de Factura</p>
                <p className="font-medium text-gray-900">{formatCurrency(bill.value)}</p>
              </div>
              {bill.consumption && (
                <>
                  <div>
                    <p className="text-gray-600">Consumo</p>
                    <p className="font-medium text-gray-900">
                      {bill.consumption} {bill.unitOfMeasure || ''}
                    </p>
                  </div>
                </>
              )}
              <div>
                <p className="text-gray-600">Creado</p>
                <p className="font-medium text-gray-900">{formatDate(bill.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Descripción */}
          {bill.description && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-700">{bill.description}</p>
            </div>
          )}

          {/* Notas */}
          {bill.notes && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notas</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{bill.notes}</p>
            </div>
          )}

          {/* Documento */}
          {bill.documentUrl && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Documento Adjunto</h3>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{bill.documentName || 'Documento'}</p>
                    <p className="text-sm text-gray-500">Documento adjunto</p>
                  </div>
                </div>
                <a
                  href={bill.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            </div>
          )}

          {/* Información de Aprobación */}
          {bill.status === 'approved' && bill.approvedAt && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Información de Aprobación</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Aprobado el</p>
                <p className="font-medium text-gray-900">{formatDate(bill.approvedAt)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <Button onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

