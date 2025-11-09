/**
 * Toast Hook
 *
 * Hook for showing toast notifications from anywhere in the app.
 * Manages toast state and provides simple API.
 */

import { useState, useCallback } from 'react';
import type { ToastType } from '@/components/toast';

interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastState extends ToastConfig {
  id: string;
  visible: boolean;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const show = useCallback((config: ToastConfig) => {
    const id = Date.now().toString();
    setToasts((prev) => [
      ...prev,
      {
        ...config,
        id,
        visible: true,
      },
    ]);

    return id;
  }, []);

  const success = useCallback(
    (message: string, duration?: number) => {
      return show({ message, type: 'success', duration });
    },
    [show]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      return show({ message, type: 'error', duration });
    },
    [show]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      return show({ message, type: 'warning', duration });
    },
    [show]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      return show({ message, type: 'info', duration });
    },
    [show]
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    dismiss,
  };
}
