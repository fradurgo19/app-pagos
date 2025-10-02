export type ServiceType = 'electricity' | 'water' | 'gas' | 'internet' | 'phone' | 'waste' | 'sewer' | 'other';

export type UnitType = 'kWh' | 'm³' | 'GB' | 'minutes' | 'units' | 'other';

export type BillStatus = 'draft' | 'pending' | 'approved' | 'overdue' | 'paid';

export type UserRole = 'basic_user' | 'area_coordinator';

export type NotificationType = 'due_reminder' | 'budget_alert' | 'approval_request' | 'bill_approved';

export interface UtilityBill {
  id: string;
  user_id: string;
  serviceType: ServiceType;
  provider?: string;
  description?: string;
  value: number;
  period: string;
  invoiceNumber?: string;
  totalAmount: number;
  consumption?: number;
  unitOfMeasure?: UnitType;
  costCenter?: string;
  location: string;
  dueDate: Date | string;
  documentUrl?: string;
  documentName?: string;
  status: BillStatus;
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UtilityBillFormData {
  serviceType: ServiceType;
  provider: string;
  description: string;
  value: string;
  period: string;
  invoiceNumber: string;
  totalAmount: string;
  consumption: string;
  unitOfMeasure: UnitType;
  costCenter: string;
  location: string;
  dueDate: string;
  attachedDocument: File | null;
  status: BillStatus;
  notes: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  location?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BudgetThreshold {
  id: string;
  serviceType: ServiceType;
  location: string;
  monthlyLimit: number;
  warningThreshold: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Notification {
  id: string;
  userId: string;
  billId?: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date | string;
}

export interface DashboardKPI {
  monthlyTotal: number;
  monthlyChange: number;
  pendingCount: number;
  overdueCount: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface FilterOptions {
  period?: string;
  serviceType?: ServiceType | 'all';
  location?: string | 'all';
  status?: BillStatus | 'all';
  search?: string;
}

export interface BillsTableColumn {
  key: keyof UtilityBill | 'actions';
  label: string;
  sortable: boolean;
  render?: (bill: UtilityBill) => React.ReactNode;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface SortState {
  column: keyof UtilityBill;
  direction: 'asc' | 'desc';
}
