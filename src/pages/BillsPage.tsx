import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Download } from 'lucide-react';
import { Button } from '../atoms/Button';
import { SearchBar } from '../molecules/SearchBar';
import { FilterBar } from '../molecules/FilterBar';
import { BillsTable } from '../organisms/BillsTable';
import { useBills } from '../hooks/useBills';
import { FilterOptions } from '../types';

export const BillsPage: React.FC = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    serviceType: 'all',
    location: 'all',
    status: 'all',
    search: ''
  });

  const { bills, loading, refresh } = useBills(filters);

  const uniqueLocations = Array.from(new Set(bills.map(b => b.location)));

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  };

  const handleExport = () => {
    const csvContent = [
      ['Período', 'Tipo de Servicio', 'Proveedor', 'Monto', 'Fecha de Vencimiento', 'Ubicación', 'Estado', 'Número de Factura'],
      ...bills.map(bill => [
        bill.period,
        bill.serviceType,
        bill.provider || '',
        bill.totalAmount.toString(),
        bill.dueDate.toString(),
        bill.location,
        bill.status,
        bill.invoiceNumber || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bills-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Facturas</h1>
          <p className="text-gray-600 mt-1">Ver y administrar todas las facturas de servicios</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Link to="/new-bill">
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Nueva Factura
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <SearchBar
            placeholder="Buscar facturas..."
            onSearch={handleSearch}
          />
        </div>
        <div className="lg:col-span-3">
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            locations={uniqueLocations}
          />
        </div>
      </div>

      <BillsTable
        bills={bills}
        onBillUpdated={refresh}
        onBillDeleted={refresh}
      />

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Mostrando {bills.length} factura{bills.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};
