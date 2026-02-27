import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';

const QUARTER_OPTIONS = [
  { value: 'Q1', label: 'Q1 (Ene-Mar)' },
  { value: 'Q2', label: 'Q2 (Abr-Jun)' },
  { value: 'Q3', label: 'Q3 (Jul-Sep)' },
  { value: 'Q4', label: 'Q4 (Oct-Dic)' }
] as const;

export interface QuarterSelectorProps {
  selectedQuarters: string[];
  year: number;
  availableYears: number[];
  onQuartersChange: (quarters: string[]) => void;
  onYearChange: (year: number) => void;
  labelClassName?: string;
  buttonClassName?: string;
  ariaLabel?: string;
}

export const QuarterSelector: React.FC<QuarterSelectorProps> = ({
  selectedQuarters,
  year,
  availableYears,
  onQuartersChange,
  onYearChange,
  labelClassName = 'block text-sm font-medium text-gray-700 mb-1',
  buttonClassName = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf1b22] bg-white flex items-center justify-between',
  ariaLabel = 'Filtrar por trimestre'
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

  const toggleQuarter = (quarter: string) => {
    if (selectedQuarters.includes(quarter)) {
      onQuartersChange(selectedQuarters.filter((q) => q !== quarter));
    } else {
      onQuartersChange([...selectedQuarters, quarter].sort((a, b) => a.localeCompare(b)));
    }
  };

  const clearQuarters = () => {
    onQuartersChange([]);
  };

  const getDisplayText = () => {
    if (selectedQuarters.length === 0) return 'Selecciona trimestre(s)';
    if (selectedQuarters.length === 4) return `${year} - Todos los trimestres`;
    if (selectedQuarters.length === 1) return `${year} - ${selectedQuarters[0]}`;
    return `${year} - ${selectedQuarters.length} trimestres`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label htmlFor="quarter-selector-btn" className={labelClassName}>
        Trimestre(s)
      </label>
      <button
        id="quarter-selector-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClassName}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 shrink-0 opacity-90" aria-hidden />
          <span className="text-sm truncate">{getDisplayText()}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 shrink-0 opacity-90 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden min-w-[200px]"
          aria-label="Selección de trimestres"
        >
          <div className="p-2 border-b border-gray-200 bg-gray-50">
            <label htmlFor="quarter-year-select" className="block text-xs text-gray-600 mb-1">
              Año
            </label>
            <select
              id="quarter-year-select"
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="w-full rounded border border-gray-300 px-2 py-1 text-gray-900 text-sm"
              aria-label="Año para trimestres"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={clearQuarters}
              className="text-xs text-gray-600 hover:text-gray-800 font-medium"
            >
              Limpiar trimestres
            </button>
          </div>
          <div className="p-2">
            {QUARTER_OPTIONS.map((q) => (
              <label
                key={q.value}
                className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedQuarters.includes(q.value)}
                  onChange={() => toggleQuarter(q.value)}
                  className="rounded border-gray-300 text-[#cf1b22] focus:ring-[#cf1b22]"
                  aria-label={q.label}
                />
                <span className="ml-2 text-sm text-gray-900">{q.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {selectedQuarters.length > 0 && selectedQuarters.length < 4 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedQuarters.map((q) => (
            <span
              key={q}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#fdebec] text-[#cf1b22]"
            >
              {year} {q}
              <button
                type="button"
                onClick={() => toggleQuarter(q)}
                className="ml-1 hover:text-[#7f0c12]"
                aria-label={`Quitar ${q}`}
              >
                <X className="w-3 h-3" aria-hidden />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
