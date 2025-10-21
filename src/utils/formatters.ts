export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '$ 0';
  
  try {
    // Formatear manualmente para mayor compatibilidad
    const formatted = value.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return `$ ${formatted}`;
  } catch (error) {
    console.error('Error formateando moneda:', error);
    // Fallback: formateo manual
    return `$ ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  }
};

export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '-';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    // Verificar que la fecha es válida
    if (isNaN(d.getTime())) return '-';
    
    // Usar toLocaleDateString en lugar de Intl.DateFormat
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return '-';
  }
};

export const formatPeriod = (period: string): string => {
  const [year, month] = period.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long'
  });
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
  return date.toLocaleDateString('es-ES', { month: 'long' });
};

export const isOverdue = (dueDate: Date | string | null | undefined): boolean => {
  if (!dueDate) return false;
  
  try {
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    if (isNaN(due.getTime())) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  } catch (error) {
    return false;
  }
};

// Traducir tipos de servicio a español
export const translateServiceType = (serviceType: string): string => {
  const translations: Record<string, string> = {
    'electricity': 'Electricidad',
    'water': 'Agua',
    'gas': 'Gas',
    'internet': 'Internet',
    'phone': 'Teléfono',
    'cellular': 'Celular',
    'waste': 'Basuras',
    'sewer': 'Alcantarillado',
    'security': 'Seguridad',
    'administration': 'Administración',
    'rent': 'Arrendamiento',
    'other': 'Otro'
  };
  
  return translations[serviceType] || serviceType;
};

// Traducir estados a español
export const translateStatus = (status: string): string => {
  const translations: Record<string, string> = {
    'draft': 'Borrador',
    'pending': 'Pendiente',
    'approved': 'Aprobado',
    'overdue': 'Vencido',
    'paid': 'Pagado'
  };
  
  return translations[status] || status;
};
