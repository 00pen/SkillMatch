import { useState, useCallback } from 'react';
import { getErrorMessage } from '../utils/errorHandler';

export const useFormValidation = (initialState = {}) => {
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback((name, value, rules = {}) => {
    const fieldErrors = [];

    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      fieldErrors.push(`${rules.label || name} is required`);
    }

    // Email validation
    if (rules.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        fieldErrors.push('Please enter a valid email address');
      }
    }

    // Password validation
    if (rules.password && value) {
      if (value.length < 8) {
        fieldErrors.push('Password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])/.test(value)) {
        fieldErrors.push('Password must contain at least one lowercase letter');
      }
      if (!/(?=.*[A-Z])/.test(value)) {
        fieldErrors.push('Password must contain at least one uppercase letter');
      }
      if (!/(?=.*\d)/.test(value)) {
        fieldErrors.push('Password must contain at least one number');
      }
    }

    // Confirm password validation
    if (rules.confirmPassword && value) {
      if (value !== rules.confirmPassword) {
        fieldErrors.push('Passwords do not match');
      }
    }

    // Phone validation
    if (rules.phone && value) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        fieldErrors.push('Please enter a valid phone number');
      }
    }

    // URL validation
    if (rules.url && value) {
      try {
        new URL(value);
      } catch {
        fieldErrors.push('Please enter a valid URL');
      }
    }

    // Custom validation
    if (rules.custom && typeof rules.custom === 'function') {
      const customError = rules.custom(value);
      if (customError) {
        fieldErrors.push(customError);
      }
    }

    return fieldErrors;
  }, []);

  const validateForm = useCallback((formData, validationRules) => {
    setIsValidating(true);
    const newErrors = {};

    Object.keys(validationRules).forEach(fieldName => {
      const value = formData[fieldName];
      const rules = validationRules[fieldName];
      const fieldErrors = validateField(fieldName, value, rules);
      
      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors[0]; // Show only first error
      }
    });

    setErrors(newErrors);
    setIsValidating(false);
    return Object.keys(newErrors).length === 0;
  }, [validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: getErrorMessage(error)
    }));
  }, []);

  const setFormError = useCallback((error) => {
    setErrors(prev => ({
      ...prev,
      submit: getErrorMessage(error)
    }));
  }, []);

  return {
    errors,
    isValidating,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    setFieldError,
    setFormError
  };
};