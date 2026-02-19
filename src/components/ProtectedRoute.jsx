import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente para proteger rutas que requieren autenticación
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, loading, role } = useAuth();

    // Mostrar loading mientras se verifica la autenticación
    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lead">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    // Redirigir a login si no está autenticado
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Verificar roles si se especificaron
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
                <div className="bg-dark-card border border-dark-border rounded-2xl p-8 max-w-md text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>
                    <p className="text-lead mb-6">
                        No tienes permisos para acceder a esta sección.
                    </p>
                    <p className="text-sm text-lead">
                        Tu rol: <span className="text-gold font-medium">{role}</span>
                    </p>
                </div>
            </div>
        );
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
