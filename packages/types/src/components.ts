/**
 * Component-related types for UI components
 */

import { ReactNode } from 'react';

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
export type ComponentState = 'idle' | 'loading' | 'success' | 'error';

export interface ButtonProps extends BaseComponentProps {
  size?: ComponentSize;
  variant?: ComponentVariant;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  size?: ComponentSize;
  error?: string;
  onChange?: (value: string) => void;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends BaseComponentProps {
  options: SelectOption[];
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  size?: ComponentSize;
  error?: string;
  onValueChange?: (value: string | number) => void;
}

export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: ComponentSize;
}

export interface TableColumn<T = any> {
  key: keyof T;
  header: string;
  cell?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<T = any> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export interface NotificationProps {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}