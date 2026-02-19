import { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, Coffee, ChefHat, RefreshCw } from 'lucide-react';
import Database from '../services/database';
import PropTypes from 'prop-types';

/**
 * Vista de Barra para Barman
 * Muestra cola de pedidos pendientes de preparar
 */
const BarmanView = ({ onNuevosPedidos }) => {
    const [pedidos, setPedidos] = useState([]);
    const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

    const cargarPedidos = useCallback(() => {
        const pendientes = Database.getPedidosPendientesBarman();
        setPedidos(pendientes);
        setUltimaActualizacion(new Date());
        if (onNuevosPedidos) onNuevosPedidos(pendientes.reduce((s, p) => s + p.itemsPendientes.length, 0));
    }, [onNuevosPedidos]);

    useEffect(() => {
        cargarPedidos();
        // Polling cada 10 segundos para simular tiempo real
        const interval = setInterval(cargarPedidos, 10000);
        return () => clearInterval(interval);
    }, [cargarPedidos]);

    const handleMarcarEstado = (pedidoId, itemId, nuevoEstado) => {
        Database.marcarItemPreparacion(pedidoId, itemId, nuevoEstado);
        cargarPedidos();
    };

    const getEstadoConfig = (estado) => {
        switch (estado) {
            case 'pendiente':
                return { label: 'Pendiente', color: 'text-red-400 bg-red-500/10 border-red-500/30', next: 'preparando', nextLabel: 'Preparar' };
            case 'preparando':
                return { label: 'Preparando', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', next: 'listo', nextLabel: 'Listo ✓' };
            case 'listo':
                return { label: 'Listo', color: 'text-green-400 bg-green-500/10 border-green-500/30', next: null, nextLabel: null };
            default:
                return { label: estado, color: 'text-lead bg-dark-border', next: null, nextLabel: null };
        }
    };

    const getMesaNumero = (mesaId) => {
        const mesas = Database.getMesas();
        const mesa = mesas.find(m => m.id === mesaId);
        return mesa ? mesa.numero : '?';
    };

    const formatHora = (iso) => {
        if (!iso) return '';
        return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    };

    const totalPendientes = pedidos.reduce((s, p) => s + p.itemsPendientes.filter(i => i.estadoPreparacion === 'pendiente').length, 0);
    const totalPreparando = pedidos.reduce((s, p) => s + p.itemsPendientes.filter(i => i.estadoPreparacion === 'preparando').length, 0);

    return (
        <div className="p-4 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gold/10 rounded-xl">
                        <ChefHat size={28} className="text-gold" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Cola de Barra</h2>
                        <p className="text-sm text-lead">
                            Actualizado: {formatHora(ultimaActualizacion.toISOString())}
                        </p>
                    </div>
                </div>
                <button
                    onClick={cargarPedidos}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-lead hover:text-white hover:border-gold/30 transition-all"
                >
                    <RefreshCw size={16} />
                    Actualizar
                </button>
            </div>

            {/* Resumen rápido */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-red-400">{totalPendientes}</div>
                    <div className="text-sm text-red-400/70 mt-1">Pendientes</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-400">{totalPreparando}</div>
                    <div className="text-sm text-yellow-400/70 mt-1">Preparando</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-400">{pedidos.length}</div>
                    <div className="text-sm text-green-400/70 mt-1">Mesas activas</div>
                </div>
            </div>

            {/* Lista de pedidos */}
            {pedidos.length === 0 ? (
                <div className="text-center py-20">
                    <CheckCircle size={64} className="text-green-400 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-white mb-2">¡Todo al día!</h3>
                    <p className="text-lead">No hay pedidos pendientes en la barra</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pedidos.map((pedido) => (
                        <div
                            key={pedido.id}
                            className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden"
                        >
                            {/* Cabecera del pedido */}
                            <div className="bg-dark-bg px-5 py-3 flex items-center justify-between border-b border-dark-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center">
                                        <span className="text-gold font-bold text-lg">{getMesaNumero(pedido.mesaId)}</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">Mesa {getMesaNumero(pedido.mesaId)}</div>
                                        <div className="text-xs text-lead flex items-center gap-1">
                                            <Clock size={11} />
                                            {formatHora(pedido.fechaCreacion)} · {pedido.mesero || 'Sin asignar'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-lead">
                                    {pedido.itemsPendientes.length} item{pedido.itemsPendientes.length !== 1 ? 's' : ''}
                                </div>
                            </div>

                            {/* Items pendientes */}
                            <div className="p-4 space-y-2">
                                {pedido.itemsPendientes.map((item) => {
                                    const config = getEstadoConfig(item.estadoPreparacion || 'pendiente');
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-3 bg-dark-bg rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Coffee size={18} className="text-lead flex-shrink-0" />
                                                <div>
                                                    <div className="font-medium text-white">
                                                        {item.cantidad}x {item.nombre}
                                                    </div>
                                                    {item.horaAgregado && (
                                                        <div className="text-xs text-lead">
                                                            Pedido a las {formatHora(item.horaAgregado)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${config.color}`}>
                                                    {config.label}
                                                </span>
                                                {config.next && (
                                                    <button
                                                        onClick={() => handleMarcarEstado(pedido.id, item.id, config.next)}
                                                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${config.next === 'listo'
                                                            ? 'bg-green-500 hover:bg-green-400 text-white'
                                                            : 'bg-yellow-500 hover:bg-yellow-400 text-dark-bg'
                                                            }`}
                                                    >
                                                        {config.nextLabel}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

BarmanView.propTypes = {
    onNuevosPedidos: PropTypes.func,
};

export default BarmanView;
