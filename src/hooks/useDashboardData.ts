import { useMemo } from 'react';
import { UtilityBill, DashboardKPI, ServiceType } from '../types';
import { getPreviousPeriod, isOverdue } from '../utils/formatters';

const SERVICE_TYPE_ORDER: ServiceType[] = [
  'electricity',
  'water',
  'gas',
  'internet',
  'phone',
  'cellular',
  'waste',
  'sewer',
  'public_lighting',
  'security',
  'administration',
  'rent',
  'other'
];

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  electricity: 'Energía',
  water: 'Acueducto',
  gas: 'Gas',
  internet: 'Internet',
  phone: 'Teléfono',
  cellular: 'Celular',
  waste: 'Aseo',
  sewer: 'Alcantarillado',
  public_lighting: 'Alumbrado Público',
  security: 'Seguridad',
  administration: 'Administración',
  rent: 'Arrendamiento',
  other: 'Otro'
};

export interface ServiceTypeDataItem {
  label: string;
  value: number;
  consumption: number;
  unitOfMeasure: string;
}

export interface LocationDataItem {
  label: string;
  value: number;
  count: number;
  unitOfMeasure: string;
}

export const useDashboardData = (
  bills: UtilityBill[],
  selectedPeriods: string[],
  allBills: UtilityBill[]
) => {
  const kpis: DashboardKPI = useMemo(() => {
    const currentMonthBills = bills;

    let monthlyChange = 0;
    if (selectedPeriods.length > 0) {
      const latestPeriod = [...selectedPeriods].sort((a, b) => b.localeCompare(a))[0];
      const previousPeriod = getPreviousPeriod(latestPeriod);
      const previousMonthBills = allBills.filter((b) => b.period === previousPeriod);
      const previousTotal = previousMonthBills.reduce((sum, b) => sum + b.totalAmount, 0);
      const currentTotal = currentMonthBills.reduce((sum, b) => sum + b.totalAmount, 0);
      monthlyChange =
        previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;
    }

    const monthlyTotal = currentMonthBills.reduce((sum, b) => sum + b.totalAmount, 0);
    const pendingCount = currentMonthBills.filter((b) => b.status === 'pending').length;
    const overdueCount = currentMonthBills.filter(
      (b) => b.status === 'pending' && isOverdue(b.dueDate)
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

    const monthlyTotals = last6Months.map((period) => {
      const periodBills = allBills.filter((b) => b.period === period);
      return periodBills.reduce((sum, b) => sum + b.totalAmount, 0);
    });

    const labels = last6Months.map((period) => {
      const [year, month] = period.split('-');
      const date = new Date(
        Number.parseInt(year, 10),
        Number.parseInt(month, 10) - 1
      );
      return date.toLocaleDateString('es-ES', { month: 'short' });
    });

    return { labels, data: monthlyTotals };
  }, [allBills]);

  const serviceTypeData = useMemo(() => {
    const addConsumptionToAggregate = (
      acc: { totalValue: number; totalConsumption: number; unitsSet: Set<string> },
      totalAmount: number,
      consumption: number | null | undefined,
      unitOfMeasure?: string
    ) => {
      acc.totalValue += Number(totalAmount) || 0;
      acc.totalConsumption += Number(consumption) || 0;
      if (unitOfMeasure) acc.unitsSet.add(unitOfMeasure);
    };

    const aggregateByType = (
      type: ServiceType
    ): { totalValue: number; totalConsumption: number; unitsSet: Set<string> } => {
      const acc = { totalValue: 0, totalConsumption: 0, unitsSet: new Set<string>() };
      for (const bill of bills) {
        const consumptions = bill.consumptions ?? [];
        if (consumptions.length > 0) {
          for (const c of consumptions) {
            if (c.serviceType === type) {
              addConsumptionToAggregate(acc, c.totalAmount, c.consumption, c.unitOfMeasure);
            }
          }
        } else if (bill.serviceType === type) {
          addConsumptionToAggregate(
            acc,
            bill.totalAmount ?? 0,
            bill.consumption,
            bill.unitOfMeasure
          );
        }
      }
      return acc;
    };

    const items: ServiceTypeDataItem[] = SERVICE_TYPE_ORDER.map((type) => {
      const { totalValue, totalConsumption, unitsSet } = aggregateByType(type);
      const unitOfMeasure = Array.from(unitsSet).join(', ') || '-';
      return {
        label: SERVICE_TYPE_LABELS[type],
        value: totalValue,
        consumption: totalConsumption,
        unitOfMeasure
      };
    });

    return { items };
  }, [bills]);

  const locationData = useMemo(() => {
    const costCenterMap = new Map<
      string,
      { totalAmount: number; count: number; units: Set<string> }
    >();

    bills.forEach((bill) => {
      const key = bill.costCenter?.trim() || 'Sin centro de costos';
      const current = costCenterMap.get(key) ?? {
        totalAmount: 0,
        count: 0,
        units: new Set<string>()
      };
      current.totalAmount += bill.totalAmount ?? 0;
      current.count += 1;
      const consumptions = bill.consumptions ?? [];
      if (consumptions.length > 0) {
        consumptions.forEach((c) => {
          if (c.unitOfMeasure) current.units.add(c.unitOfMeasure);
        });
      } else if (bill.unitOfMeasure) {
        current.units.add(bill.unitOfMeasure);
      }
      costCenterMap.set(key, current);
    });

    const labels: string[] = [];
    const data: number[] = [];
    const counts: number[] = [];
    const units: string[] = [];

    costCenterMap.forEach((v, k) => {
      labels.push(k);
      data.push(v.totalAmount);
      counts.push(v.count);
      units.push(Array.from(v.units).join(', ') || '-');
    });

    return { labels, data, counts, units };
  }, [bills]);

  return { kpis, trendData, serviceTypeData, locationData };
};
