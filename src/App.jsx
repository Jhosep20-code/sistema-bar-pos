import { useEffect, useState, useCallback } from 'react';
import { LogOut, User, DollarSign, LayoutGrid, ChefHat, BarChart2 } from 'lucide-react';
import Database from './services/database';
import TablesGrid from './components/TablesGrid';
import CashControl from './components/CashControl';
import Dashboard from './components/Dashboard';
import BarmanView from './components/BarmanView';
import useOrders from './hooks/useOrders';
import useCashRegister from './hooks/useCashRegister';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import OrderCart from './components/OrderCart';
import SplitCheckModal from './components/SplitCheckModal';
import ProfileModal from './components/ProfileModal';
import { useToast } from './components/Toast';
import './index.css';

function App() {
    const { user, profile, loading, signOut, isAuthenticated } = useAuth();
    const [vistaActual, setVistaActual] = useState('mesas');
    const [showProfile, setShowProfile] = useState(false);
    const [localProfile, setLocalProfile] = useState(profile);
    const [pedidosPendientesBarman, setPedidosPendientesBarman] = useState(0);
    const { showToast } = useToast();

    // Pasar el nombre del mesero al hook de pedidos
    const meseroActual = localProfile?.nombre || profile?.nombre || 'Sistema';

    const {
        mesas,
        mesaActual,
        pedidoActual,
        modalAbierto,
        modalSplitAbierto,
        crearPedido,
        agregarProducto,
        eliminarItem,
        actualizarCantidad,
        cerrarModal,
        cerrarModalSplit,
        abrirModalSplit,
        procesarPagoParcial,
        pedirCuenta,
        cerrarMesa,
    } = useOrders(meseroActual);

    const {
        caja,
        abrirCaja,
        cerrarCaja,
    } = useCashRegister();

    // Inicializar base de datos
    useEffect(() => {
        Database.init();
    }, []);

    // Sync profile changes
    useEffect(() => {
        setLocalProfile(profile);
    }, [profile]);

    // Contar pedidos pendientes para barman (polling)
    useEffect(() => {
        const contarPendientes = () => {
            const count = Database.contarItemsPendientesBarman();
            setPedidosPendientesBarman(count);
        };
        contarPendientes();
        const interval = setInterval(contarPendientes, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut();
            showToast('Sesión cerrada correctamente', 'success');
        } catch {
            showToast('Error al cerrar sesión', 'error');
        }
    };

    const handlePagoParcial = (itemIds, propina) => {
        const resultado = procesarPagoParcial(
            itemIds,
            propina,
            meseroActual
        );
        if (resultado?.exito) {
            showToast(
                resultado.todoPagado
                    ? `✅ Mesa cerrada · Total: S/ ${resultado.total?.toFixed(2)}`
                    : `💰 Cobrado S/ ${resultado.total?.toFixed(2)}`,
                'success'
            );
        } else {
            showToast('Error al procesar el pago', 'error');
        }
        return resultado;
    };

    // Roles
    const isAdmin = localProfile?.role === 'admin' || localProfile?.role === 'gerente';
    const isBarman = localProfile?.role === 'barman';

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lead">Cargando...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!isAuthenticated) {
        return <LoginPage />;
    }

    // Main app
    return (
        <div className="min-h-screen bg-dark-bg">
            {/* Header */}
            <header className="bg-dark-card border-b border-dark-border sticky top-0 z-40">
                <div className="px-4 py-3">
                    {/* Top bar */}
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-xl sm:text-2xl font-bold text-gold">
                            🔥 FUEGO EN LA NOCHE
                        </h1>

                        {/* User Info */}
                        <div className="flex items-center gap-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-white">
                                    {localProfile?.nombre || user?.email?.split('@')[0]}
                                </p>
                                <p className="text-xs text-lead capitalize">
                                    {localProfile?.role || 'usuario'}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowProfile(true)}
                                className="w-9 h-9 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center hover:bg-gold/30 transition-colors"
                            >
                                <User size={18} className="text-gold" />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-lead hover:text-white"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex gap-2 overflow-x-auto pb-1">
                        {/* Mesas - visible para todos excepto barman */}
                        {!isBarman && (
                            <button
                                onClick={() => setVistaActual('mesas')}
                                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap transition-all text-sm ${vistaActual === 'mesas'
                                    ? 'bg-gold text-dark-bg'
                                    : 'bg-dark-bg text-white hover:bg-dark-border'
                                    }`}
                            >
                                <LayoutGrid size={16} />
                                Mesas
                            </button>
                        )}

                        {/* Barra - visible para barman y admin */}
                        {(isBarman || isAdmin) && (
                            <button
                                onClick={() => setVistaActual('barra')}
                                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap transition-all text-sm relative ${vistaActual === 'barra'
                                    ? 'bg-gold text-dark-bg'
                                    : 'bg-dark-bg text-white hover:bg-dark-border'
                                    }`}
                            >
                                <ChefHat size={16} />
                                Barra
                                {pedidosPendientesBarman > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse">
                                        {pedidosPendientesBarman > 9 ? '9+' : pedidosPendientesBarman}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* Caja - solo admin/gerente */}
                        {isAdmin && (
                            <button
                                onClick={() => setVistaActual('caja')}
                                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap transition-all text-sm ${vistaActual === 'caja'
                                    ? 'bg-gold text-dark-bg'
                                    : 'bg-dark-bg text-white hover:bg-dark-border'
                                    }`}
                            >
                                <DollarSign size={16} />
                                Caja
                                {caja?.abierta && (
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                )}
                            </button>
                        )}

                        {/* Dashboard - todos */}
                        <button
                            onClick={() => setVistaActual('dashboard')}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap transition-all text-sm ${vistaActual === 'dashboard'
                                ? 'bg-gold text-dark-bg'
                                : 'bg-dark-bg text-white hover:bg-dark-border'
                                }`}
                        >
                            <BarChart2 size={16} />
                            Dashboard
                        </button>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-4">
                {vistaActual === 'mesas' && !isBarman && (
                    <TablesGrid
                        mesas={mesas}
                        onSeleccionarMesa={crearPedido}
                    />
                )}

                {vistaActual === 'barra' && (
                    <BarmanView
                        onNuevosPedidos={(count) => setPedidosPendientesBarman(count)}
                    />
                )}

                {vistaActual === 'caja' && isAdmin && (
                    <CashControl
                        caja={caja}
                        onAbrirCaja={abrirCaja}
                        onCerrarCaja={cerrarCaja}
                    />
                )}

                {vistaActual === 'dashboard' && <Dashboard />}
            </main>

            {/* Modals */}
            {modalAbierto && mesaActual && pedidoActual && (
                <OrderCart
                    mesa={mesaActual}
                    pedido={pedidoActual}
                    onCerrar={cerrarModal}
                    onAgregarItem={agregarProducto}
                    onActualizarCantidad={actualizarCantidad}
                    onEliminarItem={eliminarItem}
                    onProcesarPago={handlePagoParcial}
                    onPedirCuenta={pedirCuenta}
                />
            )}

            {modalSplitAbierto && mesaActual && pedidoActual && (
                <SplitCheckModal
                    pedido={pedidoActual}
                    onCerrar={cerrarModalSplit}
                    onProcesarPago={handlePagoParcial}
                />
            )}

            {showProfile && (
                <ProfileModal
                    profile={localProfile}
                    onClose={() => setShowProfile(false)}
                    onUpdate={(updatedProfile) => setLocalProfile(updatedProfile)}
                />
            )}
        </div>
    );
}

export default App;
