import { useState } from 'react';
import { DollarSign, Lock, Unlock, TrendingUp } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Componente de Control de Caja (Apertura/Cierre)
 */
const CashControl = ({ caja, onAbrirCaja, onCerrarCaja }) => {
    const [montoInicial, setMontoInicial] = useState('');
    const [montoCierre, setMontoCierre] = useState('');
    const [mostrarCierre, setMostrarCierre] = useState(false);

    const handleAbrirCaja = (e) => {
        e.preventDefault();
        const monto = parseFloat(montoInicial);

        if (isNaN(monto) || monto < 0) {
            alert('Ingresa un monto válido');
            return;
        }

        onAbrirCaja(monto);
        setMontoInicial('');
    };

    const handleCerrarCaja = (e) => {
        e.preventDefault();
        const resultado = onCerrarCaja();

        if (resultado.exito) {
            const montoDeclarado = parseFloat(montoCierre);
            const diferencia = montoDeclarado - resultado.montoEsperado;

            let mensaje = `Caja Cerrada\n\n`;
            mensaje += `Monto Inicial: S/ ${resultado.montoInicial.toFixed(2)}\n`;
            mensaje += `Ventas Totales: S/ ${resultado.ventasTotales.toFixed(2)}\n`;
            mensaje += `Monto Esperado: S/ ${resultado.montoEsperado.toFixed(2)}\n`;
            mensaje += `Monto Declarado: S/ ${montoDeclarado.toFixed(2)}\n\n`;

            if (Math.abs(diferencia) < 0.01) {
                mensaje += `✓ Caja cuadrada`;
            } else if (diferencia > 0) {
                mensaje += `⚠ Sobrante: S/ ${diferencia.toFixed(2)}`;
            } else {
                mensaje += `⚠ Faltante: S/ ${Math.abs(diferencia).toFixed(2)}`;
            }

            alert(mensaje);
            setMostrarCierre(false);
            setMontoCierre('');
        }
    };

    if (!caja) {
        return (
            <div className="p-4 max-w-md mx-auto">
                <div className="text-center text-lead">Cargando...</div>
            </div>
        );
    }

    if (!caja.abierta) {
        return (
            <div className="p-4 max-w-md mx-auto">
                <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex p-4 bg-red-500/10 rounded-full mb-4">
                            <Lock size={48} className="text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Caja Cerrada</h2>
                        <p className="text-lead">Abre la caja para comenzar a operar</p>
                    </div>

                    <form onSubmit={handleAbrirCaja}>
                        <label className="block mb-4">
                            <span className="text-sm text-lead mb-2 block">Monto Inicial</span>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lead">
                                    S/
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={montoInicial}
                                    onChange={(e) => setMontoInicial(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 pl-12 py-3 text-white focus:border-gold outline-none"
                                    required
                                />
                            </div>
                        </label>

                        <button
                            type="submit"
                            className="w-full bg-gold text-dark-bg font-bold py-4 rounded-lg hover:bg-gold/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <Unlock size={20} />
                            Abrir Caja
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Caja Abierta
    return (
        <div className="p-4 max-w-md mx-auto">
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                <div className="text-center mb-6">
                    <div className="inline-flex p-4 bg-green-500/10 rounded-full mb-4">
                        <Unlock size={48} className="text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Caja Abierta</h2>
                    <p className="text-sm text-lead">
                        {new Date(caja.fechaApertura).toLocaleString('es-PE')}
                    </p>
                </div>

                {/* Estado de la Caja */}
                <div className="space-y-4 mb-6">
                    <div className="flex justify-between p-4 bg-dark-bg rounded-lg">
                        <span className="text-lead">Monto Inicial</span>
                        <span className="font-bold text-white">
                            S/ {caja.montoInicial.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex justify-between p-4 bg-dark-bg rounded-lg">
                        <span className="text-lead">Ventas del Día</span>
                        <span className="font-bold text-green-400 flex items-center gap-1">
                            <TrendingUp size={16} />
                            S/ {caja.ventasTotales.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex justify-between p-4 bg-gold/10 border border-gold/30 rounded-lg">
                        <span className="text-gold font-medium">Monto en Caja</span>
                        <span className="font-bold text-gold text-xl">
                            S/ {caja.montoActual.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Botón Cerrar Caja */}
                {!mostrarCierre ? (
                    <button
                        onClick={() => setMostrarCierre(true)}
                        className="w-full bg-dark-bg border-2 border-red-500/50 text-red-400 font-bold py-4 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                    >
                        <Lock size={20} />
                        Cerrar Caja
                    </button>
                ) : (
                    <form onSubmit={handleCerrarCaja} className="space-y-4">
                        <div className="bg-dark-bg border border-gold/30 rounded-lg p-4">
                            <p className="text-sm text-gold mb-2">Monto Esperado:</p>
                            <p className="text-2xl font-bold text-gold">
                                S/ {caja.montoActual.toFixed(2)}
                            </p>
                        </div>

                        <label className="block">
                            <span className="text-sm text-white mb-2 block font-medium">
                                Monto Contado en Caja
                            </span>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lead">
                                    S/
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={montoCierre}
                                    onChange={(e) => setMontoCierre(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 pl-12 py-3 text-white focus:border-gold outline-none"
                                    required
                                />
                            </div>
                        </label>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setMostrarCierre(false);
                                    setMontoCierre('');
                                }}
                                className="flex-1 bg-dark-bg border border-dark-border text-white py-3 rounded-lg hover:border-white/50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Confirmar Cierre
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

CashControl.propTypes = {
    caja: PropTypes.object,
    onAbrirCaja: PropTypes.func.isRequired,
    onCerrarCaja: PropTypes.func.isRequired,
};

export default CashControl;
