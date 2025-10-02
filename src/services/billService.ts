import { UtilityBill, FilterOptions, BillStatus } from '../types';
import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthHeaders = () => {
  const token = authService.getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const mapDbRowToBill = (row: any): UtilityBill => ({
  id: row.id,
  user_id: row.user_id,
  serviceType: row.service_type as UtilityBill['serviceType'],
  provider: row.provider || undefined,
  description: row.description || undefined,
  value: row.value,
  period: row.period,
  invoiceNumber: row.invoice_number || undefined,
  totalAmount: row.total_amount,
  consumption: row.consumption || undefined,
  unitOfMeasure: (row.unit_of_measure as UtilityBill['unitOfMeasure']) || undefined,
  costCenter: row.cost_center || undefined,
  location: row.location,
  dueDate: row.due_date,
  documentUrl: row.document_url || undefined,
  documentName: row.document_name || undefined,
  status: row.status as BillStatus,
  notes: row.notes || undefined,
  approvedBy: row.approved_by || undefined,
  approvedAt: row.approved_at || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const billService = {
  async getAll(filters?: FilterOptions): Promise<UtilityBill[]> {
    const params = new URLSearchParams();
    
    if (filters?.period) params.append('period', filters.period);
    if (filters?.serviceType && filters.serviceType !== 'all') {
      params.append('serviceType', filters.serviceType);
    }
    if (filters?.location && filters.location !== 'all') {
      params.append('location', filters.location);
    }
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const queryString = params.toString();
    const url = `${API_URL}/api/bills${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener facturas');
    }

    const data = await response.json();
    return data.map(mapDbRowToBill);
  },

  async getById(id: string): Promise<UtilityBill | null> {
    const response = await fetch(`${API_URL}/api/bills/${id}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener factura');
    }

    const data = await response.json();
    return mapDbRowToBill(data);
  },

  async create(bill: Partial<UtilityBill>): Promise<UtilityBill> {
    const response = await fetch(`${API_URL}/api/bills`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bill)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear factura');
    }

    const data = await response.json();
    return mapDbRowToBill(data);
  },

  async update(id: string, updates: Partial<UtilityBill>): Promise<UtilityBill> {
    const response = await fetch(`${API_URL}/api/bills/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar factura');
    }

    const data = await response.json();
    return mapDbRowToBill(data);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/bills/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar factura');
    }
  },

  async bulkDelete(ids: string[]): Promise<void> {
    const response = await fetch(`${API_URL}/api/bills/bulk-delete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar facturas');
    }
  },

  async approve(id: string): Promise<UtilityBill> {
    const response = await fetch(`${API_URL}/api/bills/${id}/approve`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al aprobar factura');
    }

    const data = await response.json();
    return mapDbRowToBill(data);
  }
};
