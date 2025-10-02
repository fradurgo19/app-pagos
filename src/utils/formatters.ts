export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(d);
};

export const formatPeriod = (period: string): string => {
  const [year, month] = period.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return new Intl.DateFormat('es-ES', {
    year: 'numeric',
    month: 'long'
  }).format(date);
};

export const parseCurrencyInput = (value: string): number => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
};

export const formatNumberInput = (value: string): string => {
  const num = parseCurrencyInput(value);
  return num.toFixed(2);
};

export const getCurrentPeriod = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getPreviousPeriod = (period: string): string => {
  const [year, month] = period.split('-').map(Number);
  const date = new Date(year, month - 2);
  const prevYear = date.getFullYear();
  const prevMonth = String(date.getMonth() + 1).padStart(2, '0');
  return `${prevYear}-${prevMonth}`;
};

export const getMonthName = (monthNumber: number): string => {
  const date = new Date(2000, monthNumber - 1);
  return new Intl.DateFormat('es-ES', { month: 'long' }).format(date);
};

export const isOverdue = (dueDate: Date | string): boolean => {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
};
