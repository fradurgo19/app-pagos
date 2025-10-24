import React, { useState, useEffect } from 'react';
import { FileText, Calendar, DollarSign, Package, Eye, Download, File, Users as UsersIcon } from 'lucide-react';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { useAuth } from '../context/AuthContext';
import { billService } from '../services/billService';
import { UtilityBill, BillStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { BillDetailsModal } from '../molecules/BillDetailsModal';
import { API_URL } from '../config';

interface BillsByPeriod {
  [period: string]: UtilityBill[];
}

export const ReportsPage: React.FC = () => {
  const { profile } = useAuth();
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [allBills, setAllBills] = useState<UtilityBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<UtilityBill | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [users, setUsers] = useState<Array<{ id: string; fullName: string; email: string }>>([]);

  const isAdmin = profile?.role === 'area_coordinator';

  useEffect(() => {
    loadBills();
    if (isAdmin) {
      loadUsers();
    }
  }, []);

  useEffect(() => {
    filterBills();
  }, [selectedUser, allBills]);

  const loadBills = async () => {
    try {
      setLoading(true);
      const data = await billService.getAll();
      
      // Si es admin, ver todas las facturas; si no, solo las propias
      const filteredBills = isAdmin 
        ? data 
        : data.filter(bill => bill.user_id === profile?.id);
      
      // Ordenar por periodo descendente
      filteredBills.sort((a, b) => b.period.localeCompare(a.period));
      setAllBills(filteredBills);
      setBills(filteredBills);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const filterBills = () => {
    let filtered = [...allBills];
    
    // Filtrar por usuario si se seleccionó uno específico
    if (selectedUser !== 'all') {
      filtered = filtered.filter(bill => bill.user_id === selectedUser);
    }
    
    setBills(filtered);
  };

  // Agrupar facturas por periodo
  const billsByPeriod: BillsByPeriod = bills.reduce((acc, bill) => {
    const period = bill.period;
    if (!acc[period]) {
      acc[period] = [];
    }
    acc[period].push(bill);
    return acc;
  }, {} as BillsByPeriod);

  // Obtener periodos únicos ordenados
  const periods = Object.keys(billsByPeriod).sort((a, b) => b.localeCompare(a));

  // Filtrar facturas por periodo seleccionado
  const filteredBills = selectedPeriod === 'all' 
    ? bills 
    : bills.filter(b => b.period === selectedPeriod);

  // Filtrar por periodo seleccionado para la vista
  const filteredPeriods = selectedPeriod === 'all' 
    ? periods 
    : periods.filter(p => p === selectedPeriod);

  // Calcular estadísticas basadas en facturas filtradas
  const totalBills = filteredBills.length;
  const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const pendingBills = filteredBills.filter(bill => bill.status === 'pending').length;
  const approvedBills = filteredBills.filter(bill => bill.status === 'approved' || bill.status === 'paid').length;

  const getStatusBadge = (status: BillStatus) => {
    // Normalizar estados: paid y approved se muestran como aprobada
    const normalizedStatus = status === 'paid' || status === 'approved' ? 'approved' : 'pending';
    
    if (normalizedStatus === 'approved') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-800 border border-green-200">
          🟢 Aprobada
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          🟡 Pendiente
        </span>
      );
    }
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      electricity: 'Electricidad',
      water: 'Agua',
      gas: 'Gas',
      internet: 'Internet',
      phone: 'Teléfono',
      cellular: 'Celular',
      waste: 'Basuras',
      sewer: 'Alcantarillado',
      security: 'Seguridad',
      administration: 'Administración',
      rent: 'Arrendamiento',
      other: 'Otro'
    };
    return labels[type] || type;
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.fullName : 'Usuario desconocido';
  };

  const exportToCSV = () => {
    const headers = ['Periodo', 'Tipo de Servicio', 'Proveedor', 'N° Contrato', 'N° Factura', 'Monto', 'Estado', 'Fecha Vencimiento'];
    const rows = bills.map(bill => [
      bill.period,
      getServiceTypeLabel(bill.serviceType),
      bill.provider || '',
      bill.contractNumber || '',
      bill.invoiceNumber || '',
      bill.totalAmount.toString(),
      bill.status,
      formatDate(bill.dueDate)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mis_facturas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Elegante */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 rounded-2xl shadow-2xl p-8 border border-blue-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              {isAdmin ? 'Todas las Facturas' : 'Mis Facturas'}
            </h1>
            <p className="text-blue-200 text-lg">
              {isAdmin 
                ? 'Historial completo de facturas de todos los usuarios' 
                : 'Historial y seguimiento de tus facturas registradas'
              }
            </p>
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all shadow-lg backdrop-blur-sm font-medium"
          >
            <Download className="w-5 h-5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Facturas</p>
              <p className="text-2xl font-bold text-gray-900">{totalBills}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Monto Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{pendingBills}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aprobadas</p>
              <p className="text-2xl font-bold text-gray-900">{approvedBills}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="space-y-4">
          {/* Filtro por usuario (solo para admin) */}
          {isAdmin && (
            <div className="flex items-center space-x-4">
              <UsersIcon className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filtrar por usuario:</span>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los usuarios</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro por periodo */}
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Filtrar por periodo:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los periodos</option>
              {periods.map(period => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Facturas por periodo */}
      {bills.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay facturas registradas</h3>
            <p className="text-gray-600">Comienza registrando tu primera factura</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredPeriods.map(period => {
            const periodBills = billsByPeriod[period];
            const periodTotal = periodBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

            return (
              <Card key={period}>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                        Periodo: {period}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {periodBills.length} factura{periodBills.length !== 1 ? 's' : ''} • Total: {formatCurrency(periodTotal)}
                        {isAdmin && selectedUser === 'all' && (
                          <span className="ml-2 text-blue-600">
                            • {new Set(periodBills.map(b => b.user_id)).size} usuario{new Set(periodBills.map(b => b.user_id)).size !== 1 ? 's' : ''}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {periodBills.map(bill => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className={`flex-1 grid grid-cols-1 ${isAdmin ? 'md:grid-cols-7' : 'md:grid-cols-6'} gap-4`}>
                        {isAdmin && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Usuario</p>
                            <p className="font-medium text-purple-700">{getUserName(bill.user_id)}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tipo de Servicio</p>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{getServiceTypeLabel(bill.serviceType)}</p>
                            {bill.documentUrl && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800" title="Tiene documento adjunto">
                                <File className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">Proveedor</p>
                          <p className="font-medium text-gray-900">{bill.provider || 'N/A'}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">N° Contrato</p>
                          <p className="font-medium text-gray-900">{bill.contractNumber || 'N/A'}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">N° Factura</p>
                          <p className="font-medium text-gray-900">{bill.invoiceNumber || 'N/A'}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">Monto</p>
                          <p className="font-bold text-blue-600">{formatCurrency(bill.totalAmount)}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">Estado</p>
                          {getStatusBadge(bill.status)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {bill.documentUrl && (
                          <a
                            href={bill.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                            title="Descargar documento adjunto"
                          >
                            <File className="w-4 h-4" />
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBill(bill)}
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de detalles */}
      {selectedBill && (
        <BillDetailsModal
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
        />
      )}
    </div>
  );
};

