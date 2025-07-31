import * as React from "react"
import { useState, useCallback } from 'react';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
  open: boolean;
}

let toastCounter = 0;

const toastStore = {
  toasts: [] as Toast[],
  listeners: [] as Array<(toasts: Toast[]) => void>,
  
  addToast(options: ToastOptions) {
    const id = `toast-${++toastCounter}`;
    const toast: Toast = {
      id,
      open: true,
      ...options,
    };
    
    this.toasts.push(toast);
    this.notifyListeners();
    
    // Auto-remove toast after duration
    setTimeout(() => {
      this.removeToast(id);
    }, options.duration || 5000);
    
    return id;
  },
  
  removeToast(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  },
  
  notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  },
  
  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  React.useEffect(() => {
    const unsubscribe = toastStore.subscribe(setToasts);
    return unsubscribe;
  }, []);
  
  const toast = useCallback((options: ToastOptions) => {
    return toastStore.addToast(options);
  }, []);
  
  const dismiss = useCallback((id: string) => {
    toastStore.removeToast(id);
  }, []);
  
  return {
    toast,
    dismiss,
    toasts
  };
}

// Direct toast function export for easier importing
export const toast = (options: ToastOptions) => {
  return toastStore.addToast(options);
};