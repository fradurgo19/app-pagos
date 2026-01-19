import { UtilityBillFormData } from '../types';

export interface ValidationErrors {
  [key: string]: string;
}

export const validateBillForm = (formData: UtilityBillFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!formData.consumptions || formData.consumptions.length === 0) {
    errors.consumptions = 'Debe agregar al menos un consumo';
  } else {
    formData.consumptions.forEach((c, idx) => {
      if (!c.serviceType) errors[`consumptions.${idx}.serviceType`] = 'Requerido';
      if (!c.provider.trim()) errors[`consumptions.${idx}.provider`] = 'Requerido';
      if (!c.periodFrom) errors[`consumptions.${idx}.periodFrom`] = 'Requerido';
      if (!c.periodTo) errors[`consumptions.${idx}.periodTo`] = 'Requerido';
      if (c.periodFrom && c.periodTo && c.periodFrom > c.periodTo) {
        errors[`consumptions.${idx}.periodTo`] = 'La fecha hasta debe ser mayor o igual a desde';
      }
      if (!c.value || parseFloat(c.value) <= 0) {
        errors[`consumptions.${idx}.value`] = 'Debe ser mayor a 0';
      }
      if (!c.totalAmount || parseFloat(c.totalAmount) <= 0) {
        errors[`consumptions.${idx}.totalAmount`] = 'Debe ser mayor a 0';
      }
      if (c.consumption && parseFloat(c.consumption) < 0) {
        errors[`consumptions.${idx}.consumption`] = 'No puede ser negativo';
      }
    });
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

  return errors;
};

export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};
