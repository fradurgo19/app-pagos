import React, { useState } from 'react';
import { ArrowUpDown, Eye, Trash2, Download, Check } from 'lucide-react';
import { UtilityBill, SortState } from '../types';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { billService } from '../services/billService';

interface BillsTableProps {
  bills: UtilityBill[];
  onBillUpdated: () => void;
  onBillDeleted: () => void;
}

export const BillsTable: React.FC<BillsTableProps> = ({ bills, onBillUpdated, onBillDeleted }) => {
  const { profile } = useAuth();
  const [sortState, setSortState] = useState<SortState>({ column: 'createdAt', direction: 'desc' });
  const [selectedBills, setSelectedBills] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  const isAreaCoordinator = profile?.role === 'area_coordinator';

  const handleSort = (column: keyof UtilityBill) => {
    setSortState(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedBills = [...bills].sort((a, b) => {
    const aVal = a[sortState.column];
    const bVal = b[sortState.column];

    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;

    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortState.direction === 'asc' ? comparison : -comparison;
  });

  const handleSelectAll = () => {
    if (selectedBills.size === bills.length) {
      setSelectedBills(new Set());
    } else {
      setSelectedBills(new Set(bills.map(b => b.id)));
    }
  };

  const handleSelectBill = (id: string) => {
    const newSelected = new Set(selectedBills);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedBills(newSelected);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta factura?')) return;

    setLoading(id);
    try {
      await billService.delete(id);
      onBillDeleted();
    } catch (error) {
      alert('Error al eliminar la factura');
    } finally {
      setLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBills.size === 0) return;
    if (!window.confirm(`¿Eliminar ${selectedBills.size} facturas seleccionadas?`)) return;

    try {
      await billService.bulkDelete(Array.from(selectedBills));
      setSelectedBills(new Set());
      onBillDeleted();
    } catch (error) {
      alert('Error al eliminar las facturas');
    }
  };

  const handleApprove = async (id: string) => {
    if (!isAreaCoordinator) return;

    setLoading(id);
    try {
      await billService.approve(id);
      onBillUpdated();
    } catch (error) {
      alert('Error al aprobar la factura');
    } finally {
      setLoading(null);
    }
  };

  const SortIcon: React.FC<{ column: keyof UtilityBill }> = ({ column }) => (
    <ArrowUpDown
      className={`w-4 h-4 ml-1 inline ${
        sortState.column === column ? 'text-blue-600' : 'text-gray-400'
      }`}
    />
  );

  return (
    <div className="space-y-4">
      {selectedBills.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-blue-900">
            {selectedBills.size} factura{selectedBills.size > 1 ? 's' : ''} seleccionada{selectedBills.size > 1 ? 's' : ''}
          </span>
          <Button variant="danger" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar Seleccionadas
          </Button>
        </div>
      )}

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedBills.size === bills.length && bills.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label="Seleccionar todas las facturas"
                />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('period')}
              >
                Período <SortIcon column="period" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('serviceType')}
              >
                Servicio <SortIcon column="serviceType" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Proveedor
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalAmount')}
              >
                Monto <SortIcon column="totalAmount" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('dueDate')}
              >
                Vencimiento <SortIcon column="dueDate" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Ubicación
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                Estado <SortIcon column="status" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedBills.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                  No se encontraron facturas
                </td>
              </tr>
            ) : (
              sortedBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedBills.has(bill.id)}
                      onChange={() => handleSelectBill(bill.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      aria-label={`Seleccionar factura ${bill.invoiceNumber || bill.id}`}
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bill.period}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {bill.serviceType}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {bill.provider || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(bill.totalAmount)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(bill.dueDate)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {bill.location}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge status={bill.status} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      {isAreaCoordinator && bill.status === 'pending' && (
                        <button
                          onClick={() => handleApprove(bill.id)}
                          disabled={loading === bill.id}
                          className="text-green-600 hover:text-green-900"
                          aria-label="Aprobar factura"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        aria-label="Ver detalles de factura"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {bill.documentUrl && (
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          aria-label="Descargar documento"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      {bill.status === 'draft' && (
                        <button
                          onClick={() => handleDelete(bill.id)}
                          disabled={loading === bill.id}
                          className="text-red-600 hover:text-red-900"
                          aria-label="Eliminar factura"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
