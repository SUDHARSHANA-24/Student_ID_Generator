import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
                            first-letter:flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md border animate-slide-in
                            transition-all duration-300 hover:scale-102
                            ${toast.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-white' : ''}
                            ${toast.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-white' : ''}
                            ${toast.type === 'info' ? 'bg-blue-500/20 border-blue-500/30 text-white' : ''}
                            ${toast.type === 'warning' ? 'bg-yellow-500/20 border-yellow-500/30 text-white' : ''}
                        `}
                    >
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                        {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
                        {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}

                        <span className="text-sm font-medium">{toast.message}</span>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 opacity-70" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
