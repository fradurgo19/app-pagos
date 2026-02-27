import { useMemo } from 'react';
import type { UtilityBill } from '../types';

export function useDashboardFilterOptions(
  allBills: UtilityBill[],
  currentYear: number
) {
  return useMemo(() => {
    const periods = Array.from(new Set(allBills.map((b) => b.period)));
    const locs = Array.from(new Set(allBills.map((b) => b.location).filter(Boolean)));
    const years = new Set<number>();
    allBills.forEach((b) => {
      const y = b.period ? Number(b.period.slice(0, 4)) : 0;
      if (y > 0) years.add(y);
    });
    if (years.size === 0) years.add(currentYear);
    const sortedPeriods = [...periods].sort((a, b) => b.localeCompare(a));
    const sortedLocations = [...locs].sort((a, b) => a.localeCompare(b));
    const sortedYears = Array.from(years).sort((a, b) => b - a);
    return {
      availablePeriods: sortedPeriods,
      availableLocations: sortedLocations,
      availableYears: sortedYears
    };
  }, [allBills, currentYear]);
}
