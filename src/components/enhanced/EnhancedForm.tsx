import { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  success?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ 
  label, 
  required, 
  error, 
  success, 
  hint, 
  children, 
  className 
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2 animate-fade-in", className)}>
      <div className="flex items-center gap-2">
        <Label className="font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {hint && (
          <div className="group relative">
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {hint}
            </div>
          </div>
        )}
      </div>
      
      <div className="relative">
        {children}
        
        {/* Status indicators */}
        {error && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
        )}
        {success && !error && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
        )}
      </div>
      
      {/* Messages */}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1 animate-slide-down">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      {success && !error && (
        <p className="text-sm text-success flex items-center gap-1 animate-slide-down">
          <CheckCircle2 className="h-3 w-3" />
          {success}
        </p>
      )}
    </div>
  );
}

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ label, error, success, hint, leftIcon, rightIcon, className, required, ...props }, ref) => {
    return (
      <FormField label={label} required={required} error={error} success={success} hint={hint}>
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <Input
            ref={ref}
            className={cn(
              "transition-all duration-200 focus:scale-[1.02]",
              leftIcon && "pl-10",
              (rightIcon || error || success) && "pr-10",
              error && "border-destructive focus:border-destructive focus:ring-destructive",
              success && !error && "border-success focus:border-success focus:ring-success",
              className
            )}
            {...props}
          />
          {rightIcon && !error && !success && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
      </FormField>
    );
  }
);

EnhancedInput.displayName = "EnhancedInput";

interface EnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  success?: string;
  hint?: string;
}

export const EnhancedTextarea = forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({ label, error, success, hint, className, required, ...props }, ref) => {
    return (
      <FormField label={label} required={required} error={error} success={success} hint={hint}>
        <Textarea
          ref={ref}
          className={cn(
            "transition-all duration-200 focus:scale-[1.02] min-h-[100px]",
            error && "border-destructive focus:border-destructive focus:ring-destructive",
            success && !error && "border-success focus:border-success focus:ring-success",
            className
          )}
          {...props}
        />
      </FormField>
    );
  }
);

EnhancedTextarea.displayName = "EnhancedTextarea";

interface EnhancedSelectProps {
  label: string;
  error?: string;
  success?: string;
  hint?: string;
  placeholder?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  value?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  className?: string;
}

export function EnhancedSelect({ 
  label, 
  error, 
  success, 
  hint, 
  placeholder, 
  options, 
  value, 
  onValueChange, 
  required, 
  className 
}: EnhancedSelectProps) {
  return (
    <FormField label={label} required={required} error={error} success={success} hint={hint}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger 
          className={cn(
            "transition-all duration-200 focus:scale-[1.02]",
            error && "border-destructive focus:border-destructive focus:ring-destructive",
            success && !error && "border-success focus:border-success focus:ring-success",
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value} 
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

interface EnhancedCheckboxProps {
  label: string;
  description?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  required?: boolean;
  className?: string;
}

export function EnhancedCheckbox({ 
  label, 
  description, 
  checked, 
  onCheckedChange, 
  required, 
  className 
}: EnhancedCheckboxProps) {
  return (
    <div className={cn("flex items-top space-x-2 animate-fade-in", className)}>
      <Checkbox 
        id={label}
        checked={checked} 
        onCheckedChange={onCheckedChange}
        className="transition-all duration-200 hover:scale-105"
      />
      <div className="grid gap-1.5 leading-none">
        <Label
          htmlFor={label}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

interface EnhancedSwitchProps {
  label: string;
  description?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  badge?: string;
  className?: string;
}

export function EnhancedSwitch({ 
  label, 
  description, 
  checked, 
  onCheckedChange, 
  badge, 
  className 
}: EnhancedSwitchProps) {
  return (
    <div className={cn("flex items-center justify-between space-x-2 animate-fade-in", className)}>
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <Label className="text-base font-medium">{label}</Label>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <Switch 
        checked={checked} 
        onCheckedChange={onCheckedChange}
        className="transition-all duration-200 hover:scale-105"
      />
    </div>
  );
}