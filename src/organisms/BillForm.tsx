import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Send } from 'lucide-react';
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
    { value: 'waste', label: 'Basuras' },
    { value: 'sewer', label: 'Alcantarillado' },
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

  const handleInputChange = (field: keyof UtilityBillFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleSubmit = async (isDraft: boolean) => {
    setSubmitError('');

    const validationErrors = validateBillForm(formData);
    if (hasValidationErrors(validationErrors) && !isDraft) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
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
        status: isDraft ? 'draft' : 'pending',
        notes: formData.notes
      };

      await billService.create(billData);
      navigate('/bills');
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

          <Input
            label="Proveedor *"
            value={formData.provider}
            onChange={(e) => handleInputChange('provider', e.target.value)}
            placeholder="ej., Codensa, EPM, Gas Natural"
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
            label="Descripción"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Servicio mensual de energía"
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

          <Input
            label="Ubicación *"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Oficina Bogotá"
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

      <div className="flex items-center justify-end space-x-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/bills')}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          variant="ghost"
          onClick={() => handleSubmit(true)}
          isLoading={loading}
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar como Borrador
        </Button>
        <Button
          onClick={() => handleSubmit(false)}
          isLoading={loading}
        >
          <Send className="w-4 h-4 mr-2" />
          Enviar Factura
        </Button>
      </div>
    </div>
  );
};
