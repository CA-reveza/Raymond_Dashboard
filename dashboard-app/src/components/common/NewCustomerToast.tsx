import React, { useEffect } from 'react';
import { UserPlus, X } from 'lucide-react';

export interface CustomerToast {
  id: string;
  name: string;
  storeLocation?: string;
}

interface NewCustomerToastProps {
  toasts: CustomerToast[];
  onDismiss: (id: string) => void;
}

// Stays on screen for at least 3 minutes so it doesn't get missed — the
// person at the dashboard can always dismiss it manually before that with
// the X button.
const AUTO_DISMISS_MS = 3 * 60 * 1000;

const ToastItem: React.FC<{ toast: CustomerToast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="status"
      className="pointer-events-auto w-80 sm:w-96 bg-white dark:bg-[#141F38] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-200"
    >
      <div className="w-10 h-10 rounded-full bg-[#2D74B2]/10 text-[#2D74B2] flex items-center justify-center shrink-0">
        <UserPlus className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-gray-900 dark:text-gray-100">New customer walked in</div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
          <span className="font-semibold">{toast.name}</span> just connected via the WiFi portal
          {toast.storeLocation ? ` at ${toast.storeLocation}` : ''}.
        </p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 shrink-0 cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const NewCustomerToastContainer: React.FC<NewCustomerToastProps> = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
