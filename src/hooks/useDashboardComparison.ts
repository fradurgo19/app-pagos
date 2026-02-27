import { useMemo } from 'react';
import type { UtilityBill } from '../types';
import { useDashboardData } from './useDashboardData';

export function useDashboardComparison(
  periodBills: UtilityBill[],
  periodBillsCompare: UtilityBill[],
  selectedPeriods: string[],
  comparePeriods: string[],
  allBills: UtilityBill[],
  compareActive: boolean
) {
  const mainData = useDashboardData(periodBills, selectedPeriods, allBills);
  const compareData = useDashboardData(periodBillsCompare, comparePeriods, allBills);

  const compareTrendData = useMemo(() => {
    if (!compareActive || periodBillsCompare.length === 0) return undefined;
    const periods = mainData.trendData.periods ?? [];
    if (periods.length === 0) return undefined;
    return periods.map((period) =>
      periodBillsCompare
        .filter((b) => b.period === period)
        .reduce((sum, b) => sum + (b.totalAmount ?? 0), 0)
    );
  }, [compareActive, periodBillsCompare, mainData.trendData.periods]);

  const locationCompareDataAligned = useMemo(() => {
    if (!compareActive || mainData.locationData.labels.length === 0) return undefined;
    const compareLabels = compareData.locationData.labels;
    const compareValues = compareData.locationData.data;
    return mainData.locationData.labels.map(
      (label) => compareValues[compareLabels.indexOf(label)] ?? 0
    );
  }, [
    compareActive,
    mainData.locationData.labels,
    compareData.locationData.labels,
    compareData.locationData.data
  ]);

  return {
    mainData,
    compareData,
    compareTrendData,
    locationCompareDataAligned
  };
}
