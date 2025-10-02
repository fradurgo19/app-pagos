import { useMemo } from 'react';
import { UtilityBill, DashboardKPI, ServiceType } from '../types';
import { getCurrentPeriod, getPreviousPeriod, isOverdue } from '../utils/formatters';

export const useDashboardData = (bills: UtilityBill[]) => {
  const currentPeriod = getCurrentPeriod();
  const previousPeriod = getPreviousPeriod(currentPeriod);

  const kpis: DashboardKPI = useMemo(() => {
    const currentMonthBills = bills.filter(b => b.period === currentPeriod);
    const previousMonthBills = bills.filter(b => b.period === previousPeriod);

    const monthlyTotal = currentMonthBills.reduce((sum, b) => sum + b.totalAmount, 0);
    const previousTotal = previousMonthBills.reduce((sum, b) => sum + b.totalAmount, 0);
    const monthlyChange = previousTotal > 0 ? ((monthlyTotal - previousTotal) / previousTotal) * 100 : 0;

    const pendingCount = currentMonthBills.filter(b => b.status === 'pending').length;
    const overdueCount = currentMonthBills.filter(b =>
      (b.status === 'pending' || b.status === 'approved') && isOverdue(b.dueDate)
    ).length;

    return { monthlyTotal, monthlyChange, pendingCount, overdueCount };
  }, [bills, currentPeriod, previousPeriod]);

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
      const periodBills = bills.filter(b => b.period === period);
      return periodBills.reduce((sum, b) => sum + b.totalAmount, 0);
    });

    const labels = last6Months.map(period => {
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('es-ES', { month: 'short' });
    });

    return { labels, data: monthlyTotals };
  }, [bills]);

  const serviceTypeData = useMemo(() => {
    const currentMonthBills = bills.filter(b => b.period === currentPeriod);
    const serviceTypes: ServiceType[] = ['electricity', 'water', 'gas', 'internet', 'phone', 'waste', 'sewer', 'other'];
    
    const serviceLabels: Record<ServiceType, string> = {
      electricity: 'Electricidad',
      water: 'Agua',
      gas: 'Gas',
      internet: 'Internet',
      phone: 'Teléfono',
      waste: 'Basuras',
      sewer: 'Alcantarillado',
      other: 'Otro'
    };

    const data = serviceTypes.map(type => {
      const typeBills = currentMonthBills.filter(b => b.serviceType === type);
      return typeBills.reduce((sum, b) => sum + b.totalAmount, 0);
    });

    return {
      labels: serviceTypes.map(t => serviceLabels[t]),
      data
    };
  }, [bills, currentPeriod]);

  const locationData = useMemo(() => {
    const currentMonthBills = bills.filter(b => b.period === currentPeriod);
    const locationMap = new Map<string, number>();

    currentMonthBills.forEach(bill => {
      const current = locationMap.get(bill.location) || 0;
      locationMap.set(bill.location, current + bill.totalAmount);
    });

    return {
      labels: Array.from(locationMap.keys()),
      data: Array.from(locationMap.values())
    };
  }, [bills, currentPeriod]);

  return { kpis, trendData, serviceTypeData, locationData };
};
