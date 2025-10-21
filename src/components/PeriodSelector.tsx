import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { Card } from '../atoms/Card';

interface PeriodSelectorProps {
  availablePeriods: string[];
  selectedPeriods: string[];
  onChange: (periods: string[]) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  availablePeriods,
  selectedPeriods,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePeriod = (period: string) => {
    if (selectedPeriods.includes(period)) {
      onChange(selectedPeriods.filter(p => p !== period));
    } else {
      onChange([...selectedPeriods, period]);
    }
  };

  const selectAll = () => {
    onChange(availablePeriods);
  };

  const clearAll = () => {
    onChange([]);
  };

  const getDisplayText = () => {
    if (selectedPeriods.length === 0) {
      return 'Selecciona periodos';
    }
    if (selectedPeriods.length === availablePeriods.length) {
      return 'Todos los periodos';
    }
    if (selectedPeriods.length === 1) {
      return selectedPeriods[0];
    }
    return `${selectedPeriods.length} periodos seleccionados`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Periodos
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-900">{getDisplayText()}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Acciones rápidas */}
          <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Seleccionar todos
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-gray-600 hover:text-gray-800 font-medium"
            >
              Limpiar
            </button>
          </div>

          {/* Lista de periodos */}
          <div className="overflow-y-auto max-h-64">
            {availablePeriods.map(period => (
              <label
                key={period}
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPeriods.includes(period)}
                  onChange={() => togglePeriod(period)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-900">{period}</span>
              </label>
            ))}
          </div>

          {/* Contador */}
          {selectedPeriods.length > 0 && (
            <div className="p-2 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{selectedPeriods.length} de {availablePeriods.length} seleccionados</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tags de periodos seleccionados */}
      {selectedPeriods.length > 0 && selectedPeriods.length < 4 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedPeriods.map(period => (
            <span
              key={period}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
            >
              {period}
              <button
                type="button"
                onClick={() => togglePeriod(period)}
                className="ml-1 hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

