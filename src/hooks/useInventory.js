import { useState, useEffect } from 'react';
import Database from '../services/database';
import InventoryLogic from '../services/inventoryLogic';

/**
 * Hook para gestionar el inventario
 */
export const useInventory = () => {
    const [insumos, setInsumos] = useState([]);
    const [alertasStock, setAlertasStock] = useState([]);

    useEffect(() => {
        cargarInventario();
    }, []);

    const cargarInventario = () => {
        const insumosData = Database.getInsumos();
        setInsumos(insumosData);

        const alertas = InventoryLogic.obtenerAlertasStock();
        setAlertasStock(alertas);
    };

    const agregarStock = (insumoId, cantidad) => {
        Database.actualizarStockInsumo(insumoId, cantidad);
        cargarInventario();
    };

    const registrarMerma = (insumoId, cantidad, motivo) => {
        Database.registrarMerma(insumoId, cantidad, motivo);
        cargarInventario();
    };

    return {
        insumos,
        alertasStock,
        cargarInventario,
        agregarStock,
        registrarMerma,
    };
};

export default useInventory;
