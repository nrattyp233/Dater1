import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast: React.FC<ToastMessage & { onDismiss: (id: number) => void }> = ({ id, message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(id);
        }, 5000); // Auto-dismiss after 5 seconds

        return () => {
            clearTimeout(timer);
        };
    }, [id, onDismiss]);
    
    const baseClasses = "max-w-sm w-full bg-dark-3 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden";
    const typeClasses = {
        success: "text-green-400",
        error: "text-red-500",
        info: "text-blue-400",
    };

    return (
        <div className={baseClasses}>
            <div className="p-4">
                <div className="flex items-start">
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className={`text-sm font-semibold ${typeClasses[type]}`}>{message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button onClick={() => onDismiss(id)} className="inline-flex text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const newToast: ToastMessage = {
            id: Date.now(),
            message,
            type,
        };
        setToasts(prevToasts => [newToast, ...prevToasts]);
    }, []);
    
    const dismissToast = useCallback((id: number) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div
              aria-live="assertive"
              className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[100]"
            >
              <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {toasts.map(toast => (
                  <Toast key={toast.id} {...toast} onDismiss={dismissToast} />
                ))}
              </div>
            </div>
        </ToastContext.Provider>
    );
};