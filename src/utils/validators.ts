import { UtilityBillFormData } from '../types';

export interface ValidationErrors {
  [key: string]: string;
}

export const validateBillForm = (formData: UtilityBillFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!formData.serviceType) {
    errors.serviceType = 'El tipo de servicio es requerido';
  }

  if (!formData.provider.trim()) {
    errors.provider = 'El proveedor es requerido';
  }

  if (!formData.value || parseFloat(formData.value) <= 0) {
    errors.value = 'El valor debe ser mayor a 0';
  }

  if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
    errors.totalAmount = 'El monto total debe ser mayor a 0';
  }

  if (!formData.period) {
    errors.period = 'El período es requerido';
  } else {
    const periodRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!periodRegex.test(formData.period)) {
      errors.period = 'El período debe estar en formato AAAA-MM';
    }
  }

  if (!formData.location.trim()) {
    errors.location = 'La ubicación es requerida';
  }

  if (!formData.dueDate) {
    errors.dueDate = 'La fecha de vencimiento es requerida';
  }

  if (formData.consumption && parseFloat(formData.consumption) < 0) {
    errors.consumption = 'El consumo no puede ser negativo';
  }

  return errors;
};

export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};
