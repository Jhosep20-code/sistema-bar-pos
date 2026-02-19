import { useState } from 'react';
import { X, Check } from 'lucide-react';
import PropTypes from 'prop-types';
import { useToast } from './Toast';

/**
 * Modal de Cobro Dividido - Permite seleccionar items individuales para pagar
 * SOLUCIÓN AL "PROBLEMA DE LA MESA DE 15"
 */
const SplitCheckModal = ({ pedido, onCerrar, onProcesarPago }) => {
    const [itemsSeleccionados, setItemsSeleccionados] = useState([]);
    const [tipPercent, setTipPercent] = useState(0);
    const [customTip, setCustomTip] = useState('');
    const [usandoTipPersonalizado, setUsandoTipPersonalizado] = useState(false);
    const { showToast } = useToast();

    const itemsPendientes = pedido.items.filter(i => !i.pagado);

    const toggleItem = (itemId) => {
        setItemsSeleccionados(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const seleccionarTodos = () => {
        if (itemsSeleccionados.length === itemsPendientes.length) {
            setItemsSeleccionados([]);
        } else {
            setItemsSeleccionados(itemsPendientes.map(i => i.id));
        }
    };

    const totalSeleccionado = itemsPendientes
        .filter(item => itemsSeleccionados.includes(item.id))
        .reduce((sum, item) => sum + item.subtotal, 0);

    const totalRestante = pedido.total - totalSeleccionado -
        pedido.items.filter(i => i.pagado).reduce((sum, i) => sum + i.subtotal, 0);

    // Cálculo de propina
    const calcularPropina = () => {
        if (usandoTipPersonalizado && customTip) {
            return parseFloat(customTip) || 0;
        }
        return (totalSeleccionado * tipPercent) / 100;
    };

    const propina = calcularPropina();
    const totalConPropina = totalSeleccionado + propina;

    const handleSelectTipPercent = (percent) => {
        setTipPercent(percent);
        setUsandoTipPersonalizado(false);
        setCustomTip('');
    };

    const handleCustomTipChange = (value) => {
        setCustomTip(value);
        setUsandoTipPersonalizado(true);
        setTipPercent(0);
    };

    const handleProcesarPago = () => {
        if (itemsSeleccionados.length === 0) {
            showToast('Selecciona al menos un item para cobrar', 'warning');
            return;
        }

        const resultado = onProcesarPago(itemsSeleccionados, propina);

        if (resultado.exito) {
            const mensaje = propina > 0
                ? `Pago procesado: S/ ${resultado.monto.toFixed(2)} + Propina: S/ ${propina.toFixed(2)}`
                : `Pago procesado: S/ ${resultado.monto.toFixed(2)}`;
            showToast(mensaje, 'success');

            if (resultado.todoPagado) {
                setTimeout(onCerrar, 1500);
            } else {
                setItemsSeleccionados([]);
                setTipPercent(0);
                setCustomTip('');
                setUsandoTipPersonalizado(false);
            }
        } else {
            showToast(resultado.mensaje || 'Error al procesar el pago', 'error');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-dark-card rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-dark-bg p-4 border-b border-dark-border flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Seleccionar Items a Cobrar</h3>
                    <button
                        onClick={onCerrar}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Info */}
                <div className="px-4 pt-4 pb-2 bg-dark-bg/50 border-b border-dark-border">
                    <p className="text-sm text-lead mb-2">
                        ✓ Selecciona los items que esta persona va a pagar
                    </p>
                    <p className="text-xs text-lead/70">
                        Los items no seleccionados quedan pendientes en la cuenta
                    </p>
                </div>

                {/* Lista de Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {/* Botón Seleccionar/Deseleccionar Todos */}
                    <button
                        onClick={seleccionarTodos}
                        className="w-full py-2 px-4 rounded-lg bg-dark-bg border border-dark-border text-white hover:border-gold transition-colors flex items-center justify-between"
                    >
                        <span className="font-medium">
                            {itemsSeleccionados.length === itemsPendientes.length
                                ? '✓ Deseleccionar Todos'
                                : 'Seleccionar Todos'}
                        </span>
                        <Check
                            size={20}
                            className={itemsSeleccionados.length === itemsPendientes.length ? 'text-gold' : 'text-lead'}
                        />
                    </button>

                    {/* Items Individuales */}
                    {itemsPendientes.map(item => (
                        <div
                            key={item.id}
                            onClick={() => toggleItem(item.id)}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${itemsSeleccionados.includes(item.id)
                                ? 'border-gold bg-gold/10'
                                : 'border-dark-border bg-dark-bg hover:border-white/30'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-6 h-6 rounded border-2 flex items-center justify-center ${itemsSeleccionados.includes(item.id)
                                        ? 'border-gold bg-gold'
                                        : 'border-dark-border'
                                        }`}
                                >
                                    {itemsSeleccionados.includes(item.id) && (
                                        <Check size={16} className="text-dark-bg" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-white">{item.nombre}</div>
                                    <div className="text-sm text-lead">
                                        {item.cantidad} x S/ {item.precioUnitario.toFixed(2)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gold">
                                        S/ {item.subtotal.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sistema de Propinas */}
                {itemsSeleccionados.length > 0 && (
                    <div className="p-4 bg-dark-bg/50 border-t border-dark-border space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gold">💰</span>
                            <span className="text-sm font-medium text-white">¿Agregar Propina? (Opcional)</span>
                        </div>

                        {/* Porcentajes Rápidos */}
                        <div className="grid grid-cols-4 gap-2">
                            {[10, 15, 20].map(percent => (
                                <button
                                    key={percent}
                                    onClick={() => handleSelectTipPercent(percent)}
                                    className={`py-2 px-3 rounded-lg font-medium transition-all ${tipPercent === percent && !usandoTipPersonalizado
                                        ? 'bg-gold text-dark-bg'
                                        : 'bg-dark-bg border border-dark-border text-white hover:border-gold'
                                        }`}
                                >
                                    {percent}%
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    setTipPercent(0);
                                    setCustomTip('');
                                    setUsandoTipPersonalizado(false);
                                }}
                                className={`py-2 px-3 rounded-lg font-medium transition-all ${tipPercent === 0 && !usandoTipPersonalizado
                                    ? 'bg-gold text-dark-bg'
                                    : 'bg-dark-bg border border-dark-border text-white hover:border-gold'
                                    }`}
                            >
                                Sin
                            </button>
                        </div>

                        {/* Propina Personalizada */}
                        <div>
                            <label className="block text-sm text-lead mb-1">
                                S/ Monto personalizado
                            </label>
                            <input
                                type="number"
                                value={customTip}
                                onChange={(e) => handleCustomTipChange(e.target.value)}
                                placeholder="Ej: 10.50"
                                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:border-gold outline-none"
                            />
                        </div>

                        {propina > 0 && (
                            <div className="text-sm text-gold">
                                Propina: S/ {propina.toFixed(2)} ({tipPercent > 0 ? `${tipPercent}%` : 'Personalizada'})
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="p-4 bg-dark-bg border-t border-dark-border">
                    <div className="text-sm text-lead mb-3">
                        <div className="flex justify-between mb-1">
                            <span>Items seleccionados</span>
                            <span className="text-white font-medium">{itemsSeleccionados.length}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span>Subtotal</span>
                            <span className="text-white font-medium">S/ {totalSeleccionado.toFixed(2)}</span>
                        </div>
                        {propina > 0 && (
                            <div className="flex justify-between mb-1 text-gold">
                                <span>Propina</span>
                                <span className="font-medium">S/ {propina.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-dark-border">
                        <span className="text-lg font-bold text-white">Total a cobrar</span>
                        <span className="text-2xl font-bold text-gold">
                            S/ {totalConPropina.toFixed(2)}
                        </span>
                    </div>

                    <button
                        onClick={handleProcesarPago}
                        disabled={itemsSeleccionados.length === 0}
                        className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${itemsSeleccionados.length === 0
                            ? 'bg-dark-border text-lead cursor-not-allowed'
                            : 'bg-gold text-dark-bg hover:bg-gold/90'
                            }`}
                    >
                        Cobrar S/ {totalConPropina.toFixed(2)}
                    </button>
                </div>
            </div>
        </div>
    );
};

SplitCheckModal.propTypes = {
    pedido: PropTypes.object.isRequired,
    onCerrar: PropTypes.func.isRequired,
    onProcesarPago: PropTypes.func.isRequired,
};

export default SplitCheckModal;
