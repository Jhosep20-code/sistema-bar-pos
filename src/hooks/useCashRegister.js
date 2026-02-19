import { useState, useEffect } from 'react';
import Database from '../services/database';

/**
 * Hook para gestionar la caja registradora
 */
export const useCashRegister = () => {
    const [caja, setCaja] = useState(null);

    useEffect(() => {
        cargarCaja();
    }, []);

    const cargarCaja = () => {
        const cajaData = Database.getCaja();
        setCaja(cajaData);
    };

    const abrirCaja = (montoInicial, usuario = 'Administrador') => {
        const nuevaCaja = Database.abrirCaja(montoInicial, usuario);
        setCaja(nuevaCaja);
        return { exito: true };
    };

    const cerrarCaja = () => {
        if (!caja || !caja.abierta) {
            return { exito: false, mensaje: 'No hay caja abierta' };
        }

        const cajaCerrada = Database.cerrarCaja();
        setCaja(cajaCerrada);

        return {
            exito: true,
            montoEsperado: cajaCerrada.montoActual,
            montoInicial: cajaCerrada.montoInicial,
            ventasTotales: cajaCerrada.ventasTotales,
        };
    };

    const obtenerEstadoCaja = () => {
        if (!caja) return null;

        return {
            abierta: caja.abierta,
            montoActual: caja.montoActual,
            montoInicial: caja.montoInicial,
            ventasTotales: caja.ventasTotales,
            diferencia: caja.montoActual - caja.montoInicial - caja.ventasTotales,
        };
    };

    return {
        caja,
        abrirCaja,
        cerrarCaja,
        obtenerEstadoCaja,
        cargarCaja,
    };
};

export default useCashRegister;
