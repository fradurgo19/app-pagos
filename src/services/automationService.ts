import { UtilityBill } from '../types';
import { isOverdue } from '../utils/formatters';

export const automationService = {
  sendEmailNotification: async (bill: UtilityBill, type: 'new' | 'reminder' | 'approved') => {
    console.log(`[MOCK] Sending ${type} email notification for bill ${bill.id}`);
    return new Promise(resolve => setTimeout(resolve, 1000));
  },

  checkDueReminders: async (bills: UtilityBill[]) => {
    console.log('[MOCK] Checking for due date reminders...');

    const upcomingBills = bills.filter(bill => {
      if (bill.status === 'paid') return false;

      const dueDate = new Date(bill.dueDate);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      return daysUntilDue <= 3 && daysUntilDue >= 0;
    });

    console.log(`[MOCK] Found ${upcomingBills.length} bills due within 3 days`);
    return upcomingBills;
  },

  checkBudgetAlerts: async (bills: UtilityBill[], thresholds: Map<string, number>) => {
    console.log('[MOCK] Checking budget thresholds...');

    const alerts: Array<{ serviceType: string; amount: number; threshold: number }> = [];
    const currentPeriod = new Date().toISOString().slice(0, 7);

    const serviceTypeMap = new Map<string, number>();
    bills
      .filter(b => b.period === currentPeriod)
      .forEach(bill => {
        const current = serviceTypeMap.get(bill.serviceType) || 0;
        serviceTypeMap.set(bill.serviceType, current + bill.totalAmount);
      });

    serviceTypeMap.forEach((amount, serviceType) => {
      const threshold = thresholds.get(serviceType);
      if (threshold && amount >= threshold * 0.8) {
        alerts.push({ serviceType, amount, threshold });
      }
    });

    console.log(`[MOCK] Found ${alerts.length} budget alerts`);
    return alerts;
  },

  generateMonthlyReport: async (bills: UtilityBill[], period: string) => {
    console.log(`[MOCK] Generating monthly report for ${period}...`);

    const periodBills = bills.filter(b => b.period === period);
    const totalAmount = periodBills.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalConsumption = periodBills.reduce((sum, b) => sum + (b.consumption || 0), 0);

    const report = {
      period,
      totalBills: periodBills.length,
      totalAmount,
      totalConsumption,
      byServiceType: {} as Record<string, { count: number; amount: number }>,
      byLocation: {} as Record<string, { count: number; amount: number }>
    };

    periodBills.forEach(bill => {
      if (!report.byServiceType[bill.serviceType]) {
        report.byServiceType[bill.serviceType] = { count: 0, amount: 0 };
      }
      report.byServiceType[bill.serviceType].count++;
      report.byServiceType[bill.serviceType].amount += bill.totalAmount;

      if (!report.byLocation[bill.location]) {
        report.byLocation[bill.location] = { count: 0, amount: 0 };
      }
      report.byLocation[bill.location].count++;
      report.byLocation[bill.location].amount += bill.totalAmount;
    });

    console.log('[MOCK] Report generated:', report);
    return report;
  },

  exportToExcel: async (bills: UtilityBill[]) => {
    console.log('[MOCK] Exporting to Excel...');

    const csvContent = [
      ['Period', 'Service Type', 'Provider', 'Invoice Number', 'Amount', 'Consumption', 'Unit', 'Due Date', 'Location', 'Status'],
      ...bills.map(bill => [
        bill.period,
        bill.serviceType,
        bill.provider || '',
        bill.invoiceNumber || '',
        bill.totalAmount.toString(),
        bill.consumption?.toString() || '',
        bill.unitOfMeasure || '',
        bill.dueDate.toString(),
        bill.location,
        bill.status
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    console.log('[MOCK] Excel export ready');
    return url;
  },

  scheduleAutomation: () => {
    console.log('[MOCK] Automation scheduler initialized');
    console.log('[MOCK] - Daily reminder checks at 9:00 AM');
    console.log('[MOCK] - Budget alerts on bill submission');
    console.log('[MOCK] - Monthly reports on 1st of each month');
  }
};
