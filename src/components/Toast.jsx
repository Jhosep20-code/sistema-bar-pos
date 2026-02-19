import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import PropTypes from 'prop-types';

// Crear contexto global para las notificaciones
const ToastContext = createContext(null);

/**
 * Provider de Toast - Debe envolver toda la aplicación
 */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        const newToast = { id, message, type };

        setToasts((prev) => [...prev, newToast]);

        // Auto-remover después de 3 segundos
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 3000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

ToastProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

/**
 * Hook para usar el sistema de notificaciones
 */
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast debe usarse dentro de ToastProvider');
    }
    return context;
};

/**
 * Componente de Container de Toasts
 */
const ToastContainer = ({ toasts, onRemove }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => onRemove(toast.id)}
                />
            ))}
        </div>
    );
};

ToastContainer.propTypes = {
    toasts: PropTypes.array.isRequired,
    onRemove: PropTypes.func.isRequired,
};

/**
 * Componente individual de Toast
 */
const Toast = ({ message, type, onClose }) => {
    const styles = {
        success: 'bg-green-500/90 border-green-400',
        error: 'bg-red-500/90 border-red-400',
        warning: 'bg-yellow-500/90 border-yellow-400',
        info: 'bg-blue-500/90 border-blue-400',
    };

    const icons = {
        success: CheckCircle,
        error: XCircle,
        warning: AlertCircle,
        info: AlertCircle,
    };

    const Icon = icons[type] || icons.info;

    return (
        <div
            className={`${styles[type]} border-2 rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm min-w-[300px] max-w-md pointer-events-auto animate-slide-in-right`}
        >
            <div className="flex items-center gap-3">
                <Icon size={20} className="text-white flex-shrink-0" />
                <p className="text-white font-medium flex-1 text-sm">{message}</p>
                <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors flex-shrink-0"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

Toast.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    onClose: PropTypes.func.isRequired,
};

export default Toast;
