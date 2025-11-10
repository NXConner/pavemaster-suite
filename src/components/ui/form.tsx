import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card';
import { Progress } from './progress';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Save,
} from 'lucide-react';

// Form Context
interface FormContextType {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  setValue: (name: string, value: any) => void;
  setError: (name: string, error: string) => void;
  clearError: (name: string) => void;
  setTouched: (name: string, touched: boolean) => void;
  validate: (name?: string) => boolean;
  reset: () => void;
}

const FormContext = createContext<FormContextType | null>(null);

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};

// Validation types
export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  number?: boolean;
  min?: number;
  max?: number;
};

// Form Provider
interface FormProviderProps {
  children: React.ReactNode;
  initialValues?: Record<string, any>;
  validationRules?: Record<string, ValidationRule>;
  onSubmit?: (values: Record<string, any>) => Promise<void> | void;
  variant?: 'default' | 'tactical';
}

export function FormProvider({
  children,
  initialValues = {},
  validationRules = {},
  onSubmit,
  variant = 'default',
}: FormProviderProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: string, value: any): string | null => {
    const rules = validationRules[name];
    if (!rules) { return null; }

    if (rules.required && (!value || value.toString().trim() === '')) {
      return 'This field is required';
    }

    if (value && typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `Minimum length is ${rules.minLength} characters`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `Maximum length is ${rules.maxLength} characters`;
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        return 'Invalid format';
      }
      if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Invalid email address';
      }
      if (rules.phone && !/^\+?[\d\s\-()]+$/.test(value)) {
        return 'Invalid phone number';
      }
      if (rules.url && !/^https?:\/\/.+/.test(value)) {
        return 'Invalid URL';
      }
    }

    if (rules.number && value !== undefined && value !== '') {
      const num = Number(value);
      if (isNaN(num)) { return 'Must be a number'; }
      if (rules.min !== undefined && num < rules.min) {
        return `Minimum value is ${rules.min}`;
      }
      if (rules.max !== undefined && num > rules.max) {
        return `Maximum value is ${rules.max}`;
      }
    }

    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  };

  const setValue = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const setError = (name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const clearError = (name: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const setTouched = (name: string, touched: boolean) => {
    setTouchedState(prev => ({ ...prev, [name]: touched }));

    // Validate field when it's touched
    if (touched) {
      const error = validateField(name, values[name]);
      if (error) {
        setError(name, error);
      }
    }
  };

  const validate = (name?: string): boolean => {
    if (name) {
      const error = validateField(name, values[name]);
      if (error) {
        setError(name, error);
        return false;
      }
      clearError(name);
      return true;
    }

    // Validate all fields
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouchedState({});
    setIsSubmitting(false);
  };

  const handleFormSubmit = async () => {
    if (!onSubmit) { return; }

    const isValid = validate();
    if (!isValid) { return; }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contextValue: FormContextType = {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setError,
    clearError,
    setTouched,
    validate,
    reset,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <div className={cn(variant === 'tactical' && 'text-green-400')}>
        {children}
      </div>
    </FormContext.Provider>
  );
}

// Form Field Component
interface FormFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  className?: string;
  inputClassName?: string;
}

export function FormField({
  name,
  label,
  description,
  required,
  type = 'text',
  placeholder,
  options,
  className,
  inputClassName,
}: FormFieldProps) {
  const { values, errors, touched, setValue, setTouched } = useForm();

  const value = values[name] || '';
  const error = errors[name];
  const isTouched = touched[name];
  const hasError = error && isTouched;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setValue(name, e.target.value);
  };

  const handleBlur = () => {
    setTouched(name, true);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      {type === 'select' && options ? (
        <select
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            hasError && 'border-destructive focus-visible:ring-destructive',
            inputClassName,
          )}
        >
          <option value="">{placeholder || 'Select an option'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={4}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            hasError && 'border-destructive focus-visible:ring-destructive',
            inputClassName,
          )}
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          error={hasError && error ? error : undefined}
          success={isTouched && !error}
          className={inputClassName}
        />
      )}

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

// Multi-Step Form
interface Step {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  optional?: boolean;
}

interface MultiStepFormProps {
  steps: Step[];
  children: React.ReactNode;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  variant?: 'default' | 'tactical';
  className?: string;
}

export function MultiStepForm({
  steps,
  children,
  onStepChange,
  onComplete,
  variant = 'default',
  className,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { validate, isSubmitting } = useForm();

  const validateCurrentStep = (): boolean => {
    const currentStepFields = steps[currentStep]?.fields || [];
    return currentStepFields.every(field => validate(field));
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
    }
  };

  const handlePrevious = () => {
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    onStepChange?.(prevStep);
  };

  const handleComplete = () => {
    if (validateCurrentStep()) {
      onComplete?.();
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Card variant={variant === 'tactical' ? 'tactical' : 'default'} className={className}>
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className={variant === 'tactical' ? 'text-green-300' : ''}>
              {steps[currentStep]?.title}
            </CardTitle>
            <span className={cn(
              'text-sm',
              variant === 'tactical' ? 'text-green-400/70' : 'text-muted-foreground',
            )}>
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          <Progress
            value={progress}
            className={cn(
              'h-2',
              variant === 'tactical' && 'bg-green-400/20',
            )}
          />

          {steps[currentStep]?.description && (
            <p className={cn(
              'text-sm',
              variant === 'tactical' ? 'text-green-400/80' : 'text-muted-foreground',
            )}>
              {steps[currentStep].description}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="animate-fade-in-blur">
          {children}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {!isLastStep ? (
            <Button
              onClick={handleNext}
              rightIcon={<ChevronRight className="h-4 w-4" />}
              variant={variant === 'tactical' ? 'tactical' : 'default'}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              loading={isSubmitting}
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
              variant={variant === 'tactical' ? 'tactical' : 'default'}
            >
              Complete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// Form Actions
interface FormActionsProps {
  children?: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  showCancel?: boolean;
  className?: string;
  variant?: 'default' | 'tactical';
}

export function FormActions({
  children,
  submitText = 'Save',
  cancelText = 'Cancel',
  onCancel,
  showCancel = true,
  className,
  variant = 'default',
}: FormActionsProps) {
  const { isSubmitting, validate } = useForm();

  const handleSubmit = () => {
    validate();
  };

  return (
    <div className={cn('flex items-center justify-end gap-2', className)}>
      {showCancel && (
        <Button variant="outline" onClick={onCancel}>
          {cancelText}
        </Button>
      )}

      {children}

      <Button
        onClick={handleSubmit}
        loading={isSubmitting}
        leftIcon={<Save className="h-4 w-4" />}
        variant={variant === 'tactical' ? 'tactical' : 'default'}
      >
        {submitText}
      </Button>
    </div>
  );
}