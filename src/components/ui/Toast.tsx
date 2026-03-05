'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    // Auto dismiss after duration (default 5 seconds)
    const duration = toast.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 150); // Wait for exit animation
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={cn(
        'min-w-[300px] max-w-md bg-white border rounded-lg shadow-lg p-4 transition-all duration-150 transform',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        {
          'border-green-200': toast.type === 'success',
          'border-red-200': toast.type === 'error',
          'border-yellow-200': toast.type === 'warning',
          'border-blue-200': toast.type === 'info',
        }
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon
            className={cn('h-5 w-5', {
              'text-green-500': toast.type === 'success',
              'text-red-500': toast.type === 'error',
              'text-yellow-500': toast.type === 'warning',
              'text-blue-500': toast.type === 'info',
            })}
          />
        </div>
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium text-gray-900">{toast.title}</h4>
          {toast.message && (
            <p className="mt-1 text-sm text-gray-600">{toast.message}</p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Convenience hooks
export function useToastSuccess() {
  const { showToast } = useToast();
  return (title: string, message?: string) => showToast({ type: 'success', title, message });
}

export function useToastError() {
  const { showToast } = useToast();
  return (title: string, message?: string) => showToast({ type: 'error', title, message });
}

export function useToastWarning() {
  const { showToast } = useToast();
  return (title: string, message?: string) => showToast({ type: 'warning', title, message });
}

export function useToastInfo() {
  const { showToast } = useToast();
  return (title: string, message?: string) => showToast({ type: 'info', title, message });
}