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

// El backend ya devuelve datos en camelCase correctos, solo casteamos el tipo
const mapDbRowToBill = (row: any): UtilityBill => row as UtilityBill;

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
    console.log('📥 Facturas recibidas del backend:', data.length > 0 ? data[0] : 'Sin facturas');
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
