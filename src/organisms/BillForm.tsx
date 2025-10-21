import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Textarea } from '../atoms/Textarea';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { FileUpload } from '../molecules/FileUpload';
import { UtilityBillFormData, ServiceType, UnitType } from '../types';
import { validateBillForm, hasValidationErrors, ValidationErrors } from '../utils/validators';
import { parseCurrencyInput, getCurrentPeriod } from '../utils/formatters';
import { billService } from '../services/billService';
import { API_URL } from '../config';

const initialFormData: UtilityBillFormData = {
  serviceType: 'electricity',
  provider: '',
  description: '',
  value: '',
  period: getCurrentPeriod(),
  invoiceNumber: '',
  totalAmount: '',
  consumption: '',
  unitOfMeasure: 'kWh',
  costCenter: '',
  location: '',
  dueDate: '',
  attachedDocument: null,
  status: 'draft',
  notes: ''
};

export const BillForm: React.FC = () => {
  const [formData, setFormData] = useState<UtilityBillFormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();

  const serviceTypeOptions = [
    { value: 'electricity', label: 'Electricidad' },
    { value: 'water', label: 'Agua' },
    { value: 'gas', label: 'Gas' },
    { value: 'internet', label: 'Internet' },
    { value: 'phone', label: 'Teléfono' },
    { value: 'cellular', label: 'Celular' },
    { value: 'waste', label: 'Basuras' },
    { value: 'sewer', label: 'Alcantarillado' },
    { value: 'security', label: 'Seguridad' },
    { value: 'administration', label: 'Administración' },
    { value: 'rent', label: 'Arrendamiento' },
    { value: 'other', label: 'Otro' }
  ];

  const unitOptions = [
    { value: 'kWh', label: 'kWh' },
    { value: 'm³', label: 'm³' },
    { value: 'GB', label: 'GB' },
    { value: 'minutes', label: 'Minutos' },
    { value: 'units', label: 'Unidades' },
    { value: 'other', label: 'Otro' }
  ];

  const locationOptions = [
    { value: 'ITAGUI CL 30 NRO. 41-30', label: 'ITAGUI CL 30 NRO. 41-30' },
    { value: 'MEDELLIN ALMACEN PALACE. CRA 50 NRO.35-32', label: 'MEDELLIN ALMACEN PALACE. CRA 50 NRO.35-32' },
    { value: 'SEDE LUBRICANTES CL 29 NRO 41-65', label: 'SEDE LUBRICANTES CL 29 NRO 41-65' },
    { value: 'CALI CALLE 15 NRO. 38-21 LOCAL 1 y 2 yumbo', label: 'CALI CALLE 15 NRO. 38-21 LOCAL 1 y 2 yumbo' },
    { value: 'BARRANQUILLA CL 110 NRO.10-427 BODEGA NRO. 8', label: 'BARRANQUILLA CL 110 NRO.10-427 BODEGA NRO. 8' },
    { value: 'BARRANQUILLA CALLE 110 NRO. 10-427 BODEGA NRO. 7', label: 'BARRANQUILLA CALLE 110 NRO. 10-427 BODEGA NRO. 7' },
    { value: 'BOGOTA SEDE NUEVA CRA68D Nro.17A - 84', label: 'BOGOTA SEDE NUEVA CRA68D Nro.17A - 84' },
    { value: 'SEXTA CALLE 6 NRO. 26 -7 3 BOGOTA', label: 'SEXTA CALLE 6 NRO. 26 -7 3 BOGOTA' },
    { value: 'BUCARAMANGA KM 7 VIA GIRON NRO. 4-80', label: 'BUCARAMANGA KM 7 VIA GIRON NRO. 4-80' },
    { value: 'MQ BOGOTA DG 16 NRO. 96G- 85', label: 'MQ BOGOTA DG 16 NRO. 96G- 85' },
    { value: 'MAQUINARIA GUARNE KM26+800 MTS AUT. MED. B', label: 'MAQUINARIA GUARNE KM26+800 MTS AUT. MED. B' },
    { value: 'CAUCASIA CRA 20 2-170 LC 101 MALL LAS PALMAS', label: 'CAUCASIA CRA 20 2-170 LC 101 MALL LAS PALMAS' },
    { value: 'CAUCASIA CRA 20 NRO.3 A - 29', label: 'CAUCASIA CRA 20 NRO.3 A - 29' },
    { value: 'MONTERIA CRA 17 NRO. 76-94 BOSQUES DE SEVILLA', label: 'MONTERIA CRA 17 NRO. 76-94 BOSQUES DE SEVILLA' },
    { value: 'EL PORTAL. CALLE 35ASUR NRO. 45B -66', label: 'EL PORTAL. CALLE 35ASUR NRO. 45B -66' },
    { value: 'EL PORTAL. CALLE 35ASUR NRO. 45B -52', label: 'EL PORTAL. CALLE 35ASUR NRO. 45B -52' },
    { value: 'ISTMINA BOMBA ZEUZ LA 70 ALM ERA EN MVTO', label: 'ISTMINA BOMBA ZEUZ LA 70 ALM ERA EN MVTO' },
    { value: 'IBAGUE', label: 'IBAGUE' },
    { value: 'CALLE 70 SUR NRO. 43A - 15 INT 2404 CANTO LUNA', label: 'CALLE 70 SUR NRO. 43A - 15 INT 2404 CANTO LUNA' },
    { value: 'BOGOTA APTO LA RIVIERA CL 23 NRO.72-91 APT 701', label: 'BOGOTA APTO LA RIVIERA CL 23 NRO.72-91 APT 701' }
  ];

  const providerOptions: Record<ServiceType, Array<{ value: string; label: string }>> = {
    electricity: [
      { value: 'Enel Colombia (Codensa)', label: 'Enel Colombia (Codensa) - Bogotá, Cundinamarca, Tolima' },
      { value: 'EPM', label: 'EPM - Empresas Públicas de Medellín (Antioquia, Córdoba)' },
      { value: 'Celsia', label: 'Celsia (Valle del Cauca, Tolima, Caribe)' },
      { value: 'CHEC', label: 'CHEC - Central Hidroeléctrica de Caldas (Eje cafetero)' },
      { value: 'Air-e', label: 'Air-e (Atlántico, La Guajira, Magdalena)' },
      { value: 'Afinia', label: 'Afinia - Grupo EPM (Bolívar, Sucre, Cesar, Córdoba, parte de Magdalena)' },
      { value: 'EMSA', label: 'EMSA - Electrificadora del Meta (Meta)' },
      { value: 'ESSA', label: 'ESSA - Electrificadora de Santander (Santander, Norte de Santander)' },
      { value: 'CEDENAR', label: 'CEDENAR (Nariño)' },
      { value: 'EDEQ', label: 'EDEQ - Energía del Quindío (Quindío)' }
    ],
    water: [
      { value: 'EAAB', label: 'EAAB - Acueducto de Bogotá (Bogotá)' },
      { value: 'EPM', label: 'EPM (Medellín y municipios de Antioquia)' },
      { value: 'EMCALI', label: 'EMCALI (Cali)' },
      { value: 'Acuacar', label: 'Acuacar - Aguas de Cartagena (Cartagena)' },
      { value: 'Triple A', label: 'Triple A (Barranquilla y Atlántico)' },
      { value: 'Metroagua', label: 'Metroagua/Veolia (Santa Marta)' },
      { value: 'Aguas de Manizales', label: 'Aguas de Manizales (Manizales)' },
      { value: 'IBAL', label: 'IBAL (Ibagué)' }
    ],
    gas: [
      { value: 'Vanti', label: 'Vanti (Bogotá, Cundinamarca, Boyacá, Santander)' },
      { value: 'Promigas', label: 'Promigas (Costa Caribe, Valle del Cauca, Cauca)' },
      { value: 'Alcanos', label: 'Alcanos de Colombia (Tolima, Huila, Nariño, Boyacá)' },
      { value: 'Gases de Occidente', label: 'Gases de Occidente (Valle del Cauca)' },
      { value: 'Surtigas', label: 'Surtigas (Bolívar, Córdoba, Sucre)' },
      { value: 'GdO', label: 'Gas Natural del Oriente - GdO (Santander, Norte de Santander)' }
    ],
    internet: [
      { value: 'Claro', label: 'Claro (Cobertura nacional)' },
      { value: 'Movistar', label: 'Movistar (Cobertura nacional)' },
      { value: 'Tigo-UNE', label: 'Tigo-UNE (Cobertura nacional)' },
      { value: 'ETB', label: 'ETB (Principalmente Bogotá)' },
      { value: 'WOM', label: 'WOM (Ciudades principales)' },
      { value: 'Emcali Telecomunicaciones', label: 'Emcali Telecomunicaciones (Cali)' },
      { value: 'Starlink', label: 'Starlink (Internet satelital)' }
    ],
    phone: [
      { value: 'Claro', label: 'Claro (Cobertura nacional)' },
      { value: 'Movistar', label: 'Movistar (Cobertura nacional)' },
      { value: 'Tigo-UNE', label: 'Tigo-UNE (Cobertura nacional)' },
      { value: 'ETB', label: 'ETB (Principalmente Bogotá)' },
      { value: 'WOM', label: 'WOM (Ciudades principales)' }
    ],
    cellular: [
      { value: 'Claro', label: 'Claro (Cobertura nacional)' },
      { value: 'Movistar', label: 'Movistar (Cobertura nacional)' },
      { value: 'Tigo-UNE', label: 'Tigo-UNE (Cobertura nacional)' },
      { value: 'WOM', label: 'WOM (Ciudades principales)' }
    ],
    waste: [
      { value: 'Urbaser', label: 'Urbaser (Tunja, Bucaramanga, etc.)' },
      { value: 'Interaseo', label: 'Interaseo (Varias regiones)' },
      { value: 'Emvarias', label: 'Emvarias - Grupo EPM (Medellín y área metropolitana)' },
      { value: 'Promoambiental', label: 'Promoambiental Distrito (Zonas de Bogotá)' },
      { value: 'Ciudad Limpia', label: 'Ciudad Limpia (Bogotá, Cali, otros)' },
      { value: 'Bogotá Limpia', label: 'Bogotá Limpia (Bogotá)' }
    ],
    sewer: [
      { value: 'EAAB', label: 'EAAB - Acueducto de Bogotá (Bogotá)' },
      { value: 'EPM', label: 'EPM (Medellín y municipios de Antioquia)' },
      { value: 'EMCALI', label: 'EMCALI (Cali)' },
      { value: 'Acuacar', label: 'Acuacar - Aguas de Cartagena (Cartagena)' },
      { value: 'Triple A', label: 'Triple A (Barranquilla y Atlántico)' }
    ],
    security: [
      { value: 'Miro', label: 'Miro' },
      { value: 'Prosegur', label: 'Prosegur' },
      { value: 'Atlas', label: 'Atlas' }
    ],
    administration: [
      { value: 'Administración', label: 'Administración' }
    ],
    rent: [
      { value: 'Arrendador', label: 'Arrendador' }
    ],
    other: [
      { value: 'Otro', label: 'Otro proveedor' }
    ]
  };

  // Obtener proveedores según el tipo de servicio seleccionado
  const currentProviderOptions = providerOptions[formData.serviceType as ServiceType] || [];

  const handleInputChange = (field: keyof UtilityBillFormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Si se cambia el tipo de servicio, resetear el proveedor
      if (field === 'serviceType') {
        const newProviders = providerOptions[value as ServiceType] || [];
        const currentProviderExists = newProviders.some(p => p.value === prev.provider);
        if (!currentProviderExists) {
          updated.provider = '';
        }
      }
      
      // Generar descripción automáticamente
      const serviceType = field === 'serviceType' ? value : updated.serviceType;
      const provider = field === 'provider' ? value : updated.provider;
      const invoiceNumber = field === 'invoiceNumber' ? value : updated.invoiceNumber;
      
      // Traducir tipo de servicio
      const serviceTypeLabel = serviceTypeOptions.find(s => s.value === serviceType)?.label || '';
      
      // Construir descripción
      const parts = [];
      if (serviceTypeLabel) parts.push(serviceTypeLabel);
      if (provider) parts.push(provider);
      if (invoiceNumber) parts.push(invoiceNumber);
      
      updated.description = parts.join(' - ');
      
      return updated;
    });
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileSelect = (file: File | null) => {
    setFormData(prev => ({ ...prev, attachedDocument: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const validationErrors = validateBillForm(formData);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      let documentUrl = '';
      let documentName = '';

      // Subir archivo si existe
      if (formData.attachedDocument) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.attachedDocument);

        const token = localStorage.getItem('auth_token');
        const uploadResponse = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadFormData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          documentUrl = uploadData.url;
          documentName = uploadData.filename;
          console.log('✅ Archivo subido:', documentUrl);
        } else {
          throw new Error('Error al subir el archivo');
        }
      }

      const billData = {
        serviceType: formData.serviceType as ServiceType,
        provider: formData.provider,
        description: formData.description,
        value: parseCurrencyInput(formData.value),
        period: formData.period,
        invoiceNumber: formData.invoiceNumber,
        totalAmount: parseCurrencyInput(formData.totalAmount),
        consumption: formData.consumption ? parseFloat(formData.consumption) : undefined,
        unitOfMeasure: formData.unitOfMeasure as UnitType,
        costCenter: formData.costCenter,
        location: formData.location,
        dueDate: formData.dueDate,
        documentUrl: documentUrl || undefined,
        documentName: documentName || undefined,
        status: 'pending',
        notes: formData.notes
      };

      await billService.create(billData);
      navigate('/reports');
    } catch (err: any) {
      setSubmitError(err.message || 'Error al guardar la factura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600" role="alert">
          {submitError}
        </div>
      )}

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Información de la Factura</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Tipo de Servicio *"
            value={formData.serviceType}
            options={serviceTypeOptions}
            onChange={(e) => handleInputChange('serviceType', e.target.value)}
            error={errors.serviceType}
          />

          <Select
            label="Proveedor *"
            value={formData.provider}
            options={currentProviderOptions}
            onChange={(e) => handleInputChange('provider', e.target.value)}
            placeholder="Seleccione un proveedor"
            error={errors.provider}
          />

          <Input
            label="Período (AAAA-MM) *"
            type="month"
            value={formData.period}
            onChange={(e) => handleInputChange('period', e.target.value)}
            error={errors.period}
          />

          <Input
            label="Número de Factura"
            value={formData.invoiceNumber}
            onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
            placeholder="FAC-12345"
            error={errors.invoiceNumber}
          />

          <Input
            label="Descripción (generada automáticamente)"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Se genera automáticamente"
            disabled
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Monto y Consumo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Monto de la Factura *"
            type="number"
            step="0.01"
            value={formData.value}
            onChange={(e) => handleInputChange('value', e.target.value)}
            placeholder="0.00"
            error={errors.value}
          />

          <Input
            label="Monto Total *"
            type="number"
            step="0.01"
            value={formData.totalAmount}
            onChange={(e) => handleInputChange('totalAmount', e.target.value)}
            placeholder="0.00"
            error={errors.totalAmount}
          />

          <Input
            label="Consumo"
            type="number"
            step="0.01"
            value={formData.consumption}
            onChange={(e) => handleInputChange('consumption', e.target.value)}
            placeholder="0.00"
            error={errors.consumption}
          />

          <Select
            label="Unidad de Medida"
            value={formData.unitOfMeasure}
            options={unitOptions}
            onChange={(e) => handleInputChange('unitOfMeasure', e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Ubicación y Fecha de Vencimiento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Centro de Costos"
            value={formData.costCenter}
            onChange={(e) => handleInputChange('costCenter', e.target.value)}
            placeholder="Departamento de TI"
          />

          <Select
            label="Ubicación *"
            value={formData.location}
            options={locationOptions}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Seleccione una ubicación"
            error={errors.location}
          />

          <Input
            label="Fecha de Vencimiento *"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            error={errors.dueDate}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Documento y Notas</h2>
        <div className="space-y-6">
          <FileUpload
            label="Cargar Factura (PDF, JPG, PNG)"
            currentFile={formData.attachedDocument}
            onFileSelect={handleFileSelect}
          />

          <Textarea
            label="Notas"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Información adicional..."
            rows={4}
          />
        </div>
      </Card>

      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/reports')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={loading}
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar Factura
          </Button>
        </div>
      </form>
    </div>
  );
};
