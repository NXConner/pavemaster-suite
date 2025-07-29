import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  ReactNode 
} from 'react';
import { 
  useForm, 
  FormProvider, 
  UseFormReturn, 
  FieldValues, 
  SubmitHandler 
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Box, 
  BoxProps, 
  Typography 
} from '@mui/material';
import { COLOR_PALETTE } from '@/styles/design-system';
import Button from './Button';
import Input from './Input';

// Form Context for advanced form management
interface FormContextType {
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

// Form Component Props
interface FormProps<T extends FieldValues> extends BoxProps {
  schema: z.ZodType<T>;
  onSubmit: SubmitHandler<T>;
  children: (methods: UseFormReturn<T>) => ReactNode;
  title?: string;
  description?: string;
}

// Main Form Component
export function Form<T extends FieldValues>({
  schema,
  onSubmit,
  children,
  title,
  description,
  ...boxProps
}: FormProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize react-hook-form with zod validation
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    mode: 'onChange'
  });

  // Enhanced submit handler with loading state
  const handleSubmit = useCallback(async (data: T) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit]);

  return (
    <FormContext.Provider value={{ isSubmitting, setIsSubmitting }}>
      <FormProvider {...methods}>
        <Box 
          component="form" 
          onSubmit={methods.handleSubmit(handleSubmit)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxWidth: 600,
            margin: 'auto',
            padding: 3,
            borderRadius: 2,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            backgroundColor: 'white'
          }}
          {...boxProps}
        >
          {title && (
            <Typography 
              variant="h4" 
              sx={{ 
                color: COLOR_PALETTE.primary[700],
                marginBottom: 2,
                textAlign: 'center'
              }}
            >
              {title}
            </Typography>
          )}
          {description && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: COLOR_PALETTE.secondary[600],
                marginBottom: 2,
                textAlign: 'center'
              }}
            >
              {description}
            </Typography>
          )}
          {children(methods)}
        </Box>
      </FormProvider>
    </FormContext.Provider>
  );
}

// Form Field Component for consistent field rendering
export function FormField({
  name,
  label,
  type = 'text',
  ...props
}: {
  name: string;
  label: string;
  type?: string;
}) {
  const { register, formState: { errors } } = useForm();

  return (
    <Input
      label={label}
      type={type}
      {...register(name)}
      {...props}
      errorMessage={errors[name]?.message as string}
      fullWidth
    />
  );
}

// Submit Button Component
export function FormSubmitButton({
  children = 'Submit',
  ...props
}: React.ComponentProps<typeof Button>) {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error('FormSubmitButton must be used within a Form');
  }

  return (
    <Button
      type="submit"
      variant="primary"
      loading={context.isSubmitting}
      fullWidth
      {...props}
    >
      {children}
    </Button>
  );
}

// Utility hook for form context
export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a Form');
  }
  return context;
}

export default Form;
