import React from 'react';
import { Select } from '../atoms/Select';
import { FilterOptions, ServiceType, BillStatus } from '../types';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  locations: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  locations
}) => {
  const serviceTypeOptions = [
    { value: 'all', label: 'Todos los Servicios' },
    { value: 'electricity', label: 'Electricidad' },
    { value: 'water', label: 'Agua' },
    { value: 'gas', label: 'Gas' },
    { value: 'internet', label: 'Internet' },
    { value: 'phone', label: 'Teléfono' },
    { value: 'waste', label: 'Basuras' },
    { value: 'sewer', label: 'Alcantarillado' },
    { value: 'other', label: 'Otro' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos los Estados' },
    { value: 'draft', label: 'Borrador' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'approved', label: 'Aprobado' },
    { value: 'overdue', label: 'Vencido' },
    { value: 'paid', label: 'Pagado' }
  ];

  const locationOptions = [
    { value: 'all', label: 'Todas las Ubicaciones' },
    ...locations.map(loc => ({ value: loc, label: loc }))
  ];

  const handleChange = (key: keyof FilterOptions, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Select
        label="Tipo de Servicio"
        value={filters.serviceType || 'all'}
        options={serviceTypeOptions}
        onChange={(e) => handleChange('serviceType', e.target.value as ServiceType | 'all')}
      />
      <Select
        label="Ubicación"
        value={filters.location || 'all'}
        options={locationOptions}
        onChange={(e) => handleChange('location', e.target.value)}
      />
      <Select
        label="Estado"
        value={filters.status || 'all'}
        options={statusOptions}
        onChange={(e) => handleChange('status', e.target.value as BillStatus | 'all')}
      />
    </div>
  );
};
