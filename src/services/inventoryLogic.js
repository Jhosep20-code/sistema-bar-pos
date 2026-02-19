// Lógica para descontar automáticamente insumos del inventario
// cuando se vende un producto (basado en recetas)

import Database from './database';

class InventoryLogic {
    /**
     * Procesa el descuento de inventario al completar un pedido
     * @param {Array} items - Items del pedido [{productoId, cantidad}, ...]
     * @returns {Object} - Resultado con éxito o errores
     */
    static procesarDescuentoInventario(items) {
        const errores = [];
        const insuficientes = [];

        // Primero verificar si hay suficiente stock
        for (const item of items) {
            if (item.pagado) continue; // Solo descontar items no pagados aún

            const recetas = Database.getRecetasByProducto(item.productoId);

            for (const receta of recetas) {
                const insumo = Database.getById('insumos_inventario', receta.insumoId);
                const cantidadNecesaria = receta.cantidad * item.cantidad;
                const cantidadDisponible = insumo.stock * insumo.cantidadPorUnidad;

                if (cantidadDisponible < cantidadNecesaria) {
                    insuficientes.push({
                        producto: item.nombre,
                        insumo: insumo.nombre,
                        necesario: cantidadNecesaria,
                        disponible: cantidadDisponible,
                    });
                }
            }
        }

        // Si hay insuficiencias, no procesar
        if (insuficientes.length > 0) {
            return {
                exito: false,
                insuficientes,
                mensaje: 'Stock insuficiente para completar el pedido',
            };
        }

        // Proceder con el descuento
        for (const item of items) {
            if (item.pagado) continue;

            const recetas = Database.getRecetasByProducto(item.productoId);

            for (const receta of recetas) {
                const insumo = Database.getById('insumos_inventario', receta.insumoId);
                const cantidadDescontar = receta.cantidad * item.cantidad;

                // Calcular cuántas unidades descontar
                const unidadesDescontar = cantidadDescontar / insumo.cantidadPorUnidad;

                Database.actualizarStockInsumo(receta.insumoId, -unidadesDescontar);
            }
        }

        return {
            exito: true,
            mensaje: 'Inventario actualizado correctamente',
        };
    }

    /**
     * Obtiene la lista de insumos necesarios para un producto
     * @param {string} productoId
     * @returns {Array} - Lista de insumos con cantidades
     */
    static obtenerInsumosProducto(productoId) {
        const recetas = Database.getRecetasByProducto(productoId);
        const insumos = [];

        for (const receta of recetas) {
            const insumo = Database.getById('insumos_inventario', receta.insumoId);
            insumos.push({
                nombre: insumo.nombre,
                cantidad: receta.cantidad,
                unidad: this.obtenerUnidadMedida(receta.cantidad, insumo.unidad),
            });
        }

        return insumos;
    }

    /**
     * Verifica si un producto puede prepararse (hay stock suficiente)
     * @param {string} productoId
     * @param {number} cantidad
     * @returns {boolean}
     */
    static verificarDisponibilidad(productoId, cantidad = 1) {
        const recetas = Database.getRecetasByProducto(productoId);

        for (const receta of recetas) {
            const insumo = Database.getById('insumos_inventario', receta.insumoId);
            const cantidadNecesaria = receta.cantidad * cantidad;
            const cantidadDisponible = insumo.stock * insumo.cantidadPorUnidad;

            if (cantidadDisponible < cantidadNecesaria) {
                return false;
            }
        }

        return true;
    }

    /**
     * Obtiene alertas de stock bajo
     * @returns {Array} - Lista de insumos con stock bajo
     */
    static obtenerAlertasStock() {
        const insumos = Database.getInsumos();
        return insumos.filter(i => i.stock <= i.stockMinimo);
    }

    /**
     * Helper para formatear unidades de medida
     */
    static obtenerUnidadMedida(cantidad, unidadBase) {
        if (unidadBase === 'botella' || unidadBase === 'litro') {
            return `${cantidad}ml`;
        }
        if (unidadBase === 'kg') {
            return cantidad >= 1000 ? `${cantidad / 1000}kg` : `${cantidad}g`;
        }
        if (unidadBase === 'unidad' || unidadBase === 'lata') {
            return `${cantidad} ${unidadBase}${cantidad > 1 ? 'es' : ''}`;
        }
        return `${cantidad} ${unidadBase}`;
    }
}

export default InventoryLogic;
