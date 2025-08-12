// Lightweight toast hook placeholder. Replace with your UI toast system when available.
export type ToastVariant = 'default' | 'destructive' | 'success' | 'info';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

export const toast = (opts: ToastOptions) => {
  try {
    // In development, log to console. Integrate with a proper toast UI later.
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.log('[toast]', opts);
    }
  } catch {
    // no-op
  }
};

export const useToast = () => ({ toast });

export default useToast;
