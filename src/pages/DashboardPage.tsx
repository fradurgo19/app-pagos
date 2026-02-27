import React, { useState, useMemo, useCallback } from 'react';
import { DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { KPICard } from '../molecules/KPICard';
import { TrendChart, ServiceTypeChart, LocationChart } from '../organisms/DashboardCharts';
import { useBills } from '../hooks/useBills';
import { useDashboardData } from '../hooks/useDashboardData';
import { formatCurrency, getCurrentPeriod } from '../utils/formatters';
import { PeriodSelector } from '../components/PeriodSelector';

const QUARTER_MONTHS: Record<string, string[]> = {
  Q1: ['01', '02', '03'],
  Q2: ['04', '05', '06'],
  Q3: ['07', '08', '09'],
  Q4: ['10', '11', '12']
};

export const DashboardPage: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([getCurrentPeriod()]);
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');
  const { bills: allBills, loading } = useBills({});

  const availablePeriods = useMemo(() => {
    const periods = Array.from(new Set(allBills.map((b) => b.period)));
    return periods.sort((a, b) => b.localeCompare(a));
  }, [allBills]);

  const availableLocations = useMemo(() => {
    const locs = Array.from(new Set(allBills.map((b) => b.location).filter(Boolean)));
    return locs.sort((a, b) => a.localeCompare(b));
  }, [allBills]);

  const applyQuarter = useCallback(
    (quarter: string) => {
      if (!quarter) return;
      const months = QUARTER_MONTHS[quarter];
      if (!months) return;
      const periods = months.map((m) => `${currentYear}-${m}`);
      setSelectedPeriods(periods);
    },
    [currentYear]
  );

  const handleQuarterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setSelectedQuarter(value);
      if (value) applyQuarter(value);
    },
    [applyQuarter]
  );

  const periodBills = useMemo(() => {
    let result = allBills;
    if (selectedPeriods.length > 0) {
      result = result.filter((bill) => selectedPeriods.includes(bill.period));
    }
    if (locationFilter !== 'all') {
      result = result.filter((bill) => bill.location === locationFilter);
    }
    return result;
  }, [allBills, selectedPeriods, locationFilter]);

  const { kpis, trendData, serviceTypeData, locationData } = useDashboardData(
    periodBills,
    selectedPeriods,
    allBills
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#cf1b22]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-[#cf1b22] via-[#a11217] to-[#50504f] rounded-2xl shadow-2xl p-8 border border-[#cf1b22]/40">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Panel de Control</h1>
            <p className="text-white/80 text-lg">
              Análisis y resumen de facturas empresariales
              {selectedPeriods.length > 0 && (
                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white/20 text-white backdrop-blur-sm">
                  {selectedPeriods.length === 1
                    ? selectedPeriods[0]
                    : `${selectedPeriods.length} periodos`}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <label htmlFor="dashboard-filter-sede" className="block text-sm font-medium text-white/90 mb-1">Sede</label>
              <select
                id="dashboard-filter-sede"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-white/50 focus:outline-none"
                aria-label="Filtrar por sede"
              >
                <option value="all">Todas las sedes</option>
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc} className="text-gray-900">
                    {loc.length > 35 ? `${loc.slice(0, 32)}...` : loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-40">
              <label htmlFor="dashboard-filter-trimestre" className="block text-sm font-medium text-white/90 mb-1">Trimestre</label>
              <select
                id="dashboard-filter-trimestre"
                value={selectedQuarter}
                onChange={handleQuarterChange}
                className="w-full px-3 py-2 rounded-lg border border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-white/50 focus:outline-none"
                aria-label="Filtrar por trimestre"
              >
                <option value="">Ninguno</option>
                <option value="Q1" className="text-gray-900">Q1 (Ene-Mar)</option>
                <option value="Q2" className="text-gray-900">Q2 (Abr-Jun)</option>
                <option value="Q3" className="text-gray-900">Q3 (Jul-Sep)</option>
                <option value="Q4" className="text-gray-900">Q4 (Oct-Dic)</option>
              </select>
            </div>

            <div className="w-72">
              <PeriodSelector
                availablePeriods={availablePeriods}
                selectedPeriods={selectedPeriods}
                onChange={(periods) => {
                  setSelectedQuarter('');
                  setSelectedPeriods(periods);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title={selectedPeriods.length === 1 ? 'Total Mensual' : 'Total Periodos'}
          value={formatCurrency(kpis.monthlyTotal)}
          change={kpis.monthlyChange}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          iconColor="bg-[#cf1b22]"
        />
        <KPICard
          title="Facturas Pendientes"
          value={kpis.pendingCount.toString()}
          icon={<Clock className="w-6 h-6 text-white" />}
          iconColor="bg-[#50504f]"
        />
        <KPICard
          title="Facturas Vencidas"
          value={kpis.overdueCount.toString()}
          icon={<AlertCircle className="w-6 h-6 text-white" />}
          iconColor="bg-[#a11217]"
        />
        <KPICard
          title="Facturas Aprobadas"
          value={periodBills.filter((b) => b.status === 'approved' || b.status === 'paid').length.toString()}
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          iconColor="bg-[#d94c52]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart labels={trendData.labels} data={trendData.data} />
        <ServiceTypeChart
          items={serviceTypeData.items}
          title={
            selectedPeriods.length === 1
              ? 'Mes Actual por Tipo de Servicio'
              : 'Periodos por Tipo de Servicio'
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <LocationChart
          labels={locationData.labels}
          data={locationData.data}
          counts={locationData.counts}
          units={locationData.units}
          title={
            selectedPeriods.length === 1
              ? 'Distribución por Centro de Costos'
              : 'Distribución por Centro de Costos (Periodos Seleccionados)'
          }
        />
      </div>
    </div>
  );
};
