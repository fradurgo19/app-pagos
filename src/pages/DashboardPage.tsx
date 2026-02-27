import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DollarSign, Clock, AlertCircle, CheckCircle, GitCompare } from 'lucide-react';
import { KPICard } from '../molecules/KPICard';
import { TrendChart, ServiceTypeChart, LocationChart } from '../organisms/DashboardCharts';
import { useBills } from '../hooks/useBills';
import { useDashboardComparison } from '../hooks/useDashboardComparison';
import { useDashboardFilterOptions } from '../hooks/useDashboardFilterOptions';
import { formatCurrency } from '../utils/formatters';
import { PeriodSelector } from '../components/PeriodSelector';
import { QuarterSelector } from '../components/QuarterSelector';

const QUARTER_MONTHS: Record<string, string[]> = {
  Q1: ['01', '02', '03'],
  Q2: ['04', '05', '06'],
  Q3: ['07', '08', '09'],
  Q4: ['10', '11', '12']
};

function getCompareLabel(comparePeriods: string[]): string {
  if (comparePeriods.length === 1) return comparePeriods[0];
  if (comparePeriods.length > 1) return `${comparePeriods.length} periodos`;
  return 'Comparativa';
}

/* eslint-disable sonarjs/cognitive-complexity -- Dashboard filters, compare mode and charts require multiple branches */
export const DashboardPage: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [selectedQuarters, setSelectedQuarters] = useState<string[]>([]);
  const [yearForQuarters, setYearForQuarters] = useState<number>(currentYear);
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [compareActive, setCompareActive] = useState<boolean>(false);
  const [comparePeriods, setComparePeriods] = useState<string[]>([]);
  const { bills: allBills, loading } = useBills({});
  const { availablePeriods, availableLocations, availableYears } = useDashboardFilterOptions(
    allBills,
    currentYear
  );

  const handleQuartersChange = useCallback((quarters: string[]) => {
    setSelectedQuarters(quarters);
  }, []);

  useEffect(() => {
    if (selectedQuarters.length === 0) return;
    const months = selectedQuarters.flatMap((q) => QUARTER_MONTHS[q] ?? []);
    const periods = [...new Set(months)].sort((a, b) => a.localeCompare(b)).map((m) => `${yearForQuarters}-${m}`);
    setSelectedPeriods(periods);
  }, [selectedQuarters, yearForQuarters]);

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

  const periodBillsCompare = useMemo(() => {
    if (!compareActive || comparePeriods.length === 0) return [];
    let result = allBills.filter((bill) => comparePeriods.includes(bill.period));
    if (locationFilter !== 'all') {
      result = result.filter((bill) => bill.location === locationFilter);
    }
    return result;
  }, [allBills, compareActive, comparePeriods, locationFilter]);

  const {
    mainData,
    compareData,
    compareTrendData,
    locationCompareDataAligned
  } = useDashboardComparison(
    periodBills,
    periodBillsCompare,
    selectedPeriods,
    comparePeriods,
    allBills,
    compareActive
  );

  const handlePeriodsChange = useCallback((periods: string[]) => {
    setSelectedQuarters([]);
    setSelectedPeriods(periods);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#cf1b22]" />
      </div>
    );
  }

  const hasCompare = compareActive && comparePeriods.length > 0;
  const compareLabel = getCompareLabel(comparePeriods);

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
                  {selectedPeriods.length === 1 ? selectedPeriods[0] : `${selectedPeriods.length} periodos`}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <label
                htmlFor="dashboard-filter-sede"
                className="block text-sm font-medium text-white/90 mb-1"
              >
                Sede
              </label>
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

            <div className="w-44">
              <QuarterSelector
                selectedQuarters={selectedQuarters}
                year={yearForQuarters}
                availableYears={availableYears.length > 0 ? availableYears : [currentYear]}
                onQuartersChange={handleQuartersChange}
                onYearChange={setYearForQuarters}
                labelClassName="block text-sm font-medium text-white/90 mb-1"
                buttonClassName="w-full px-3 py-2 rounded-lg border border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-white/50 focus:outline-none flex items-center justify-between"
                ariaLabel="Filtrar por trimestre(s)"
              />
            </div>

            <div className="w-72">
              <PeriodSelector
                availablePeriods={availablePeriods}
                selectedPeriods={selectedPeriods}
                onChange={handlePeriodsChange}
                labelClassName="block text-sm font-medium text-white/90 mb-1"
                buttonClassName="w-full px-3 py-2 rounded-lg border border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-white/50 focus:outline-none flex items-center justify-between"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/20">
          <label
            htmlFor="dashboard-compare-toggle"
            className="flex items-center gap-2 cursor-pointer text-white/90"
          >
            <input
              id="dashboard-compare-toggle"
              type="checkbox"
              checked={compareActive}
              onChange={(e) => {
                setCompareActive(e.target.checked);
                if (!e.target.checked) setComparePeriods([]);
              }}
              className="rounded border-white/30 text-[#cf1b22] focus:ring-[#cf1b22]"
              aria-label="Activar comparativa"
            />
            <GitCompare className="w-4 h-4" aria-hidden />
            <span className="text-sm font-medium">Activar comparativa entre periodos</span>
          </label>
          {compareActive && (
            <div className="mt-3 flex items-end gap-2">
              <div className="w-72">
                <p className="block text-sm font-medium text-white/90 mb-1" id="compare-period-label">
                  Periodo a comparar
                </p>
                <PeriodSelector
                  availablePeriods={availablePeriods}
                  selectedPeriods={comparePeriods}
                  onChange={setComparePeriods}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title={selectedPeriods.length === 1 ? 'Total Mensual' : 'Total Periodos'}
          value={formatCurrency(mainData.kpis.monthlyTotal)}
          change={mainData.kpis.monthlyChange}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          iconColor="bg-[#cf1b22]"
          compareValue={hasCompare ? formatCurrency(compareData.kpis.monthlyTotal) : undefined}
          compareLabel={compareActive ? compareLabel : undefined}
        />
        <KPICard
          title="Facturas Pendientes"
          value={mainData.kpis.pendingCount.toString()}
          icon={<Clock className="w-6 h-6 text-white" />}
          iconColor="bg-[#50504f]"
          compareValue={hasCompare ? compareData.kpis.pendingCount.toString() : undefined}
          compareLabel={compareActive ? compareLabel : undefined}
        />
        <KPICard
          title="Facturas Vencidas"
          value={mainData.kpis.overdueCount.toString()}
          icon={<AlertCircle className="w-6 h-6 text-white" />}
          iconColor="bg-[#a11217]"
          compareValue={hasCompare ? compareData.kpis.overdueCount.toString() : undefined}
          compareLabel={compareActive ? compareLabel : undefined}
        />
        <KPICard
          title="Facturas Aprobadas"
          value={periodBills.filter((b) => b.status === 'approved' || b.status === 'paid').length.toString()}
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          iconColor="bg-[#d94c52]"
          compareValue={
            hasCompare
              ? periodBillsCompare.filter(
                  (b) => b.status === 'approved' || b.status === 'paid'
                ).length.toString()
              : undefined
          }
          compareLabel={compareActive ? compareLabel : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TrendChart
          labels={mainData.trendData.labels}
          data={mainData.trendData.data}
          compareLabel={compareLabel}
          compareData={compareTrendData}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ServiceTypeChart
          items={mainData.serviceTypeData.items}
          title={
            selectedPeriods.length === 1
              ? 'Mes Actual por Tipo de Servicio'
              : 'Periodos por Tipo de Servicio'
          }
          compareItems={hasCompare ? compareData.serviceTypeData.items : undefined}
          compareLabel={compareLabel}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <LocationChart
          labels={mainData.locationData.labels}
          data={mainData.locationData.data}
          counts={mainData.locationData.counts}
          unitsSummary={mainData.locationData.unitsSummary}
          title={
            selectedPeriods.length === 1
              ? 'Distribución por Sede'
              : 'Distribución por Sede (Periodos Seleccionados)'
          }
          compareData={locationCompareDataAligned}
          compareLabel={compareLabel}
        />
      </div>
    </div>
  );
};
