import React, { useState, useMemo } from 'react';
import { DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { KPICard } from '../molecules/KPICard';
import { TrendChart, ServiceTypeChart, LocationChart } from '../organisms/DashboardCharts';
import { useBills } from '../hooks/useBills';
import { useDashboardData } from '../hooks/useDashboardData';
import { formatCurrency, getCurrentPeriod } from '../utils/formatters';
import { PeriodSelector } from '../components/PeriodSelector';

export const DashboardPage: React.FC = () => {
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([getCurrentPeriod()]);
  const { bills: allBills, loading } = useBills({});
  
  // Filtrar facturas por periodos seleccionados
  const periodBills = useMemo(() => {
    if (selectedPeriods.length === 0) {
      return allBills;
    }
    return allBills.filter(bill => selectedPeriods.includes(bill.period));
  }, [allBills, selectedPeriods]);

  // Obtener periodos disponibles
  const availablePeriods = useMemo(() => {
    const periods = Array.from(new Set(allBills.map(b => b.period)));
    return periods.sort((a, b) => b.localeCompare(a));
  }, [allBills]);

  const { kpis, trendData, serviceTypeData, locationData } = useDashboardData(periodBills, selectedPeriods, allBills);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 rounded-2xl shadow-2xl p-8 border border-blue-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Panel de Control</h1>
            <p className="text-blue-200 text-lg">
              Análisis y resumen de facturas empresariales
              {selectedPeriods.length > 0 && (
                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white/20 text-white backdrop-blur-sm">
                  {selectedPeriods.length === 1 ? selectedPeriods[0] : `${selectedPeriods.length} periodos`}
                </span>
              )}
            </p>
          </div>
          <div className="w-72">
            <PeriodSelector
              availablePeriods={availablePeriods}
              selectedPeriods={selectedPeriods}
              onChange={setSelectedPeriods}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title={selectedPeriods.length === 1 ? "Total Mensual" : "Total Periodos"}
          value={formatCurrency(kpis.monthlyTotal)}
          change={kpis.monthlyChange}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          iconColor="bg-blue-500"
        />
        <KPICard
          title="Facturas Pendientes"
          value={kpis.pendingCount.toString()}
          icon={<Clock className="w-6 h-6 text-white" />}
          iconColor="bg-yellow-500"
        />
        <KPICard
          title="Facturas Vencidas"
          value={kpis.overdueCount.toString()}
          icon={<AlertCircle className="w-6 h-6 text-white" />}
          iconColor="bg-red-500"
        />
        <KPICard
          title="Facturas Aprobadas"
          value={(periodBills.filter(b => b.status === 'approved' || b.status === 'paid').length).toString()}
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          iconColor="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart labels={trendData.labels} data={trendData.data} />
        <ServiceTypeChart 
          labels={serviceTypeData.labels} 
          data={serviceTypeData.data}
          title={selectedPeriods.length === 1 ? "Mes Actual por Tipo de Servicio" : "Periodos Seleccionados por Tipo de Servicio"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <LocationChart 
          labels={locationData.labels} 
          data={locationData.data}
          title={selectedPeriods.length === 1 ? "Distribución por Centro de Costos" : "Distribución por Centro de Costos (Periodos Seleccionados)"}
        />
      </div>
    </div>
  );
};
