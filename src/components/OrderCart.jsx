import { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart, DollarSign, ArrowLeft } from 'lucide-react';
import PropTypes from 'prop-types';
import Database from '../services/database';
import SplitCheckModal from './SplitCheckModal';

/**
 * Interfaz de carrito de compras para pedidos
 */
const OrderCart = ({
    mesa,
    pedido,
    onCerrar,
    onAgregarItem,
    onActualizarCantidad,
    onEliminarItem,
    onProcesarPago,
    onPedirCuenta,
}) => {
    const [mostrarProductos, setMostrarProductos] = useState(true);
    const [mostrarModalPago, setMostrarModalPago] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('todos');

    const productos = Database.getProductos();
    const categorias = ['todos', ...new Set(productos.map(p => p.categoria))];

    const productosFiltrados = selectedCategory === 'todos'
        ? productos
        : productos.filter(p => p.categoria === selectedCategory);

    const handleAgregarProducto = (productoId) => {
        const resultado = onAgregarItem(productoId);
        if (!resultado.exito) {
            alert(resultado.mensaje);
        }
    };

    const handleCambiarCantidad = (itemId, delta) => {
        const item = pedido.items.find(i => i.id === itemId);
        if (!item) return;

        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad < 1) {
            onEliminarItem(itemId);
        } else {
            const resultado = onActualizarCantidad(itemId, nuevaCantidad);
            if (!resultado.exito) {
                alert(resultado.mensaje);
            }
        }
    };

    const itemsPendientes = pedido?.items.filter(i => !i.pagado) || [];
    const totalPendiente = itemsPendientes.reduce((sum, item) => sum + item.subtotal, 0);

    return (
        <div className="fixed inset-0 bg-dark-bg z-50 flex flex-col">
            {/* Header */}
            <div className="bg-dark-card border-b border-dark-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onCerrar}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-white">Mesa {mesa.numero}</h2>
                        <p className="text-sm text-lead">
                            {itemsPendientes.length} items · S/ {totalPendiente.toFixed(2)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setMostrarProductos(!mostrarProductos)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${mostrarProductos
                                ? 'bg-gold text-dark-bg'
                                : 'bg-dark-card border border-dark-border text-white'
                            }`}
                    >
                        {mostrarProductos ? 'Ver Pedido' : 'Agregar Items'}
                    </button>
                </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto">
                {mostrarProductos ? (
                    <div className="p-4">
                        {/* Categorías */}
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                            {categorias.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                                            ? 'bg-gold text-dark-bg'
                                            : 'bg-dark-card border border-dark-border text-lead'
                                        }`}
                                >
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Grid de Productos */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {productosFiltrados.map((producto) => (
                                <button
                                    key={producto.id}
                                    onClick={() => handleAgregarProducto(producto.id)}
                                    className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-gold transition-all hover:scale-105 active:scale-95"
                                >
                                    <div className="text-4xl mb-2">{producto.imagen}</div>
                                    <div className="text-sm font-medium text-white mb-1">
                                        {producto.nombre}
                                    </div>
                                    <div className="text-lg font-bold text-gold">
                                        S/ {producto.precio}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-4">
                        {pedido.items.length === 0 ? (
                            <div className="text-center py-12">
                                <ShoppingCart size={48} className="mx-auto text-lead mb-4" />
                                <p className="text-lead">No hay items en el pedido</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pedido.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`bg-dark-card border rounded-xl p-4 ${item.pagado
                                                ? 'border-green-500/30 opacity-60'
                                                : 'border-dark-border'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="font-medium text-white">{item.nombre}</div>
                                                <div className="text-sm text-lead">
                                                    S/ {item.precioUnitario} × {item.cantidad}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-gold">
                                                    S/ {item.subtotal.toFixed(2)}
                                                </div>
                                                {item.pagado && (
                                                    <div className="text-xs text-green-500">Pagado</div>
                                                )}
                                            </div>
                                        </div>

                                        {!item.pagado && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-2 bg-dark-bg rounded-lg p-1">
                                                    <button
                                                        onClick={() => handleCambiarCantidad(item.id, -1)}
                                                        className="p-2 hover:bg-white/5 rounded transition-colors"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="w-8 text-center font-medium">
                                                        {item.cantidad}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCambiarCantidad(item.id, 1)}
                                                        className="p-2 hover:bg-white/5 rounded transition-colors"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => onEliminarItem(item.id)}
                                                    className="ml-auto p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer - Acciones */}
            {itemsPendientes.length > 0 && (
                <div className="bg-dark-card border-t border-dark-border p-4">
                    <div className="mb-3">
                        <div className="flex justify-between text-sm text-lead mb-1">
                            <span>Items pendientes</span>
                            <span>{itemsPendientes.length}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold">
                            <span>Total</span>
                            <span className="text-gold">S/ {totalPendiente.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onPedirCuenta}
                            className="px-6 py-3 bg-dark-bg border border-dark-border rounded-lg font-medium text-white hover:border-gold transition-colors"
                        >
                            Pedir Cuenta
                        </button>
                        <button
                            onClick={() => setMostrarModalPago(true)}
                            className="px-6 py-3 bg-gold text-dark-bg rounded-lg font-bold hover:bg-gold/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <DollarSign size={20} />
                            Cobrar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Cobro Dividido */}
            {mostrarModalPago && (
                <SplitCheckModal
                    pedido={pedido}
                    onCerrar={() => setMostrarModalPago(false)}
                    onProcesarPago={onProcesarPago}
                />
            )}
        </div>
    );
};

OrderCart.propTypes = {
    mesa: PropTypes.object.isRequired,
    pedido: PropTypes.object.isRequired,
    onCerrar: PropTypes.func.isRequired,
    onAgregarItem: PropTypes.func.isRequired,
    onActualizarCantidad: PropTypes.func.isRequired,
    onEliminarItem: PropTypes.func.isRequired,
    onProcesarPago: PropTypes.func.isRequired,
    onPedirCuenta: PropTypes.func.isRequired,
};

export default OrderCart;
