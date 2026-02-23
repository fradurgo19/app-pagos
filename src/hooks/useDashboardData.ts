import { useMemo } from 'react';
import { UtilityBill, DashboardKPI, ServiceType } from '../types';
import { getPreviousPeriod, isOverdue } from '../utils/formatters';

export const useDashboardData = (bills: UtilityBill[], selectedPeriods: string[], allBills: UtilityBill[]) => {
  const kpis: DashboardKPI = useMemo(() => {
    // Usar las facturas ya filtradas
    const currentMonthBills = bills;
    
    // Para el cambio, calcular el total del mes anterior al más reciente seleccionado
    let monthlyChange = 0;
    if (selectedPeriods.length > 0) {
      const latestPeriod = [...selectedPeriods].sort((a, b) => b.localeCompare(a))[0];
      const previousPeriod = getPreviousPeriod(latestPeriod);
      const previousMonthBills = allBills.filter(b => b.period === previousPeriod);
      const previousTotal = previousMonthBills.reduce((sum, b) => sum + b.totalAmount, 0);
      const currentTotal = currentMonthBills.reduce((sum, b) => sum + b.totalAmount, 0);
      monthlyChange = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;
    }

    const monthlyTotal = currentMonthBills.reduce((sum, b) => sum + b.totalAmount, 0);
    const pendingCount = currentMonthBills.filter(b => b.status === 'pending').length;
    
    // Solo contar como vencidas las facturas PENDIENTES que están vencidas
    // Las aprobadas no cuentan como vencidas aunque hayan pasado la fecha
    const overdueCount = currentMonthBills.filter(b =>
      b.status === 'pending' && isOverdue(b.dueDate)
    ).length;

    return { monthlyTotal, monthlyChange, pendingCount, overdueCount };
  }, [bills, allBills, selectedPeriods]);

  const trendData = useMemo(() => {
    const last6Months: string[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      last6Months.push(`${year}-${month}`);
    }

    const monthlyTotals = last6Months.map(period => {
      const periodBills = allBills.filter(b => b.period === period);
      return periodBills.reduce((sum, b) => sum + b.totalAmount, 0);
    });

    const labels = last6Months.map(period => {
      const [year, month] = period.split('-');
      const date = new Date(Number.parseInt(year, 10), Number.parseInt(month, 10) - 1);
      return date.toLocaleDateString('es-ES', { month: 'short' });
    });

    return { labels, data: monthlyTotals };
  }, [allBills]);

  const serviceTypeData = useMemo(() => {
    // Usar las facturas ya filtradas por periodo
    const currentMonthBills = bills;
    const serviceTypes: ServiceType[] = ['electricity', 'water', 'gas', 'internet', 'phone', 'cellular', 'waste', 'sewer', 'security', 'administration', 'rent', 'public_lighting', 'other'];

    const serviceLabels: Record<ServiceType, string> = {
      electricity: 'Energía',
      water: 'Agua',
      gas: 'Gas',
      internet: 'Internet',
      phone: 'Teléfono',
      cellular: 'Celular',
      waste: 'Aseo',
      sewer: 'Alcantarillado',
      security: 'Seguridad',
      administration: 'Administración',
      rent: 'Arrendamiento',
      public_lighting: 'Alumbrado Público',
      other: 'Otro'
    };

    const data = serviceTypes.map(type => {
      const typeBills = currentMonthBills.filter(b => b.serviceType === type);
      return typeBills.reduce((sum, b) => sum + b.totalAmount, 0);
    });

    // Filtrar solo los servicios que tienen datos
    const filteredLabels: string[] = [];
    const filteredData: number[] = [];
    
    serviceTypes.forEach((type, index) => {
      if (data[index] > 0) {
        filteredLabels.push(serviceLabels[type]);
        filteredData.push(data[index]);
      }
    });

    return {
      labels: filteredLabels,
      data: filteredData
    };
  }, [bills]);

  const locationData = useMemo(() => {
    // Usar las facturas ya filtradas por periodo
    const currentMonthBills = bills;
    const locationMap = new Map<string, number>();

    currentMonthBills.forEach(bill => {
      const current = locationMap.get(bill.location) || 0;
      locationMap.set(bill.location, current + bill.totalAmount);
    });

    return {
      labels: Array.from(locationMap.keys()),
      data: Array.from(locationMap.values())
    };
  }, [bills]);

  return { kpis, trendData, serviceTypeData, locationData };
};
