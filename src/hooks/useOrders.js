import { useState, useEffect } from 'react';
import Database from '../services/database';
import InventoryLogic from '../services/inventoryLogic';

/**
 * Hook para gestionar pedidos y mesas
 */
export const useOrders = (meseroActual = 'Sistema') => {
    const [mesas, setMesas] = useState([]);
    const [pedidoActual, setPedidoActual] = useState(null);
    const [mesaActual, setMesaActual] = useState(null);

    useEffect(() => {
        cargarMesas();
    }, []);

    const cargarMesas = () => {
        const mesasData = Database.getMesas();
        setMesas(mesasData);
    };

    const seleccionarMesa = (mesaId) => {
        const mesa = Database.getMesaById(mesaId);
        setMesaActual(mesa);

        if (mesa.pedidoActualId) {
            const pedido = Database.getPedidoById(mesa.pedidoActualId);
            setPedidoActual(pedido);
        } else {
            // Crear nuevo pedido con el mesero asignado
            const nuevoPedido = Database.crearPedido(mesaId, meseroActual);
            Database.actualizarEstadoMesa(mesaId, 'ocupada', nuevoPedido.id);
            // También guardar mesero en la mesa
            Database.update('mesas', mesaId, { meseroAsignado: meseroActual });
            setPedidoActual(nuevoPedido);
            cargarMesas();
        }
    };

    const agregarItem = (productoId, cantidad = 1) => {
        if (!pedidoActual) return;

        // Verificar disponibilidad
        if (!InventoryLogic.verificarDisponibilidad(productoId, cantidad)) {
            return {
                exito: false,
                mensaje: 'Stock insuficiente para este producto',
            };
        }

        const pedidoActualizado = Database.agregarItemPedido(
            pedidoActual.id,
            productoId,
            cantidad
        );
        setPedidoActual(pedidoActualizado);

        return { exito: true };
    };

    const eliminarItem = (itemId) => {
        if (!pedidoActual) return;

        const pedido = { ...pedidoActual };
        pedido.items = pedido.items.filter(item => item.id !== itemId);
        pedido.total = pedido.items.reduce((sum, item) => sum + item.subtotal, 0);

        Database.update('pedidos', pedido.id, pedido);
        setPedidoActual(pedido);
    };

    const actualizarCantidad = (itemId, nuevaCantidad) => {
        if (!pedidoActual || nuevaCantidad < 1) return;

        const pedido = { ...pedidoActual };
        const item = pedido.items.find(i => i.id === itemId);

        if (item) {
            // Verificar disponibilidad para la nueva cantidad
            const diferencia = nuevaCantidad - item.cantidad;
            if (diferencia > 0) {
                if (!InventoryLogic.verificarDisponibilidad(item.productoId, diferencia)) {
                    return {
                        exito: false,
                        mensaje: 'Stock insuficiente',
                    };
                }
            }

            item.cantidad = nuevaCantidad;
            item.subtotal = item.cantidad * item.precioUnitario;
            pedido.total = pedido.items.reduce((sum, i) => sum + i.subtotal, 0);

            Database.update('pedidos', pedido.id, pedido);
            setPedidoActual(pedido);
        }

        return { exito: true };
    };

    const procesarPagoParcial = (itemsSeleccionados, propina = 0, mesero = 'Sistema') => {
        if (!pedidoActual) return { exito: false };

        const itemsAPagar = pedidoActual.items.filter(item =>
            itemsSeleccionados.includes(item.id) && !item.pagado
        );

        // Descontar inventario solo de los items que se están pagando
        const resultado = InventoryLogic.procesarDescuentoInventario(itemsAPagar);

        if (!resultado.exito) {
            return resultado;
        }

        // Marcar items como pagados
        const pedido = { ...pedidoActual };
        const totalItems = itemsAPagar.reduce((sum, item) => sum + item.subtotal, 0);
        const totalPagado = totalItems + propina;

        pedido.items = pedido.items.map(item => ({
            ...item,
            pagado: itemsSeleccionados.includes(item.id) ? true : item.pagado,
        }));

        pedido.pagosParciales.push({
            fecha: new Date().toISOString(),
            items: itemsSeleccionados,
            subtotal: totalItems,
            propina: propina,
            total: totalPagado,
        });

        // Verificar si todos los items están pagados
        const todoPagado = pedido.items.every(item => item.pagado);

        if (todoPagado) {
            pedido.estado = 'cerrado';
            Database.actualizarEstadoMesa(mesaActual.id, 'libre', null);
            setPedidoActual(null);
            setMesaActual(null);
        } else {
            pedido.estado = 'parcialmente_pagado';
            Database.actualizarEstadoMesa(mesaActual.id, 'cuenta_pedida', pedido.id);
        }

        Database.update('pedidos', pedido.id, pedido);
        Database.registrarVenta(totalPagado);
        Database.registrarVentaDetallada({
            pedidoId: pedido.id,
            mesaId: mesaActual.id,
            items: itemsAPagar.map(i => ({
                productoId: i.productoId,
                nombre: i.nombre,
                cantidad: i.cantidad,
                precio: i.precioUnitario,
            })),
            subtotal: totalItems,
            propina: propina,
            total: totalPagado,
            mesero: mesero, // NUEVO: Guardar el nombre del mesero
        });

        if (!todoPagado) {
            setPedidoActual(pedido);
        }

        cargarMesas();

        return {
            exito: true,
            monto: totalItems,
            propina: propina,
            total: totalPagado,
            todoPagado,
        };
    };

    const pedirCuenta = () => {
        if (!mesaActual) return;
        Database.actualizarEstadoMesa(mesaActual.id, 'cuenta_pedida', pedidoActual.id);
        cargarMesas();
    };

    const cerrarMesa = () => {
        setPedidoActual(null);
        setMesaActual(null);
        cargarMesas();
    };

    const cerrarModal = () => {
        setPedidoActual(null);
        setMesaActual(null);
        cargarMesas();
    };

    return {
        mesas,
        mesaActual,
        pedidoActual,
        modalAbierto: !!pedidoActual,
        modalSplitAbierto: false,
        crearPedido: seleccionarMesa,
        agregarProducto: agregarItem,
        eliminarItem,
        actualizarCantidad,
        cerrarModal,
        cerrarModalSplit: () => { },
        abrirModalSplit: () => { },
        procesarPagoParcial,
        pedirCuenta,
        cerrarMesa,
    };
};

export default useOrders;
