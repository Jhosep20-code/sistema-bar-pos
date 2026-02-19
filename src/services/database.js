// Simulación de base de datos relacional con LocalStorage
// Estructura: Productos_Venta, Insumos_Inventario, Recetas, Mesas, Pedidos, Caja

const STORAGE_KEYS = {
    PRODUCTOS: 'productos_venta',
    INSUMOS: 'insumos_inventario',
    RECETAS: 'recetas',
    MESAS: 'mesas',
    PEDIDOS: 'pedidos',
    CAJA: 'caja',
    MERMAS: 'mermas',
    VENTAS: 'ventas',
};

class Database {
    // Inicializar base de datos con datos de ejemplo
    static init() {
        if (!localStorage.getItem(STORAGE_KEYS.PRODUCTOS)) {
            this.seedData();
        }
    }

    // CRUD Genérico
    static getAll(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    static getById(key, id) {
        const items = this.getAll(key);
        return items.find(item => item.id === id);
    }

    static save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    static add(key, item) {
        const items = this.getAll(key);
        const newItem = { ...item, id: item.id || this.generateId() };
        items.push(newItem);
        this.save(key, items);
        return newItem;
    }

    static update(key, id, updates) {
        const items = this.getAll(key);
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates };
            this.save(key, items);
            return items[index];
        }
        return null;
    }

    static delete(key, id) {
        const items = this.getAll(key);
        const filtered = items.filter(item => item.id !== id);
        this.save(key, filtered);
    }

    static generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Datos de ejemplo (seed data)
    static seedData() {
        // Insumos de Inventario
        const insumos = [
            { id: 'ins-1', nombre: 'Pisco 750ml', unidad: 'botella', stock: 20, cantidadPorUnidad: 750, stockMinimo: 5 },
            { id: 'ins-2', nombre: 'Ron 750ml', unidad: 'botella', stock: 15, cantidadPorUnidad: 750, stockMinimo: 5 },
            { id: 'ins-3', nombre: 'Vodka 750ml', unidad: 'botella', stock: 18, cantidadPorUnidad: 750, stockMinimo: 5 },
            { id: 'ins-4', nombre: 'Limón', unidad: 'kg', stock: 10, cantidadPorUnidad: 1000, stockMinimo: 3 },
            { id: 'ins-5', nombre: 'Jarabe de Goma', unidad: 'litro', stock: 8, cantidadPorUnidad: 1000, stockMinimo: 2 },
            { id: 'ins-6', nombre: 'Coca Cola 2L', unidad: 'botella', stock: 30, cantidadPorUnidad: 2000, stockMinimo: 10 },
            { id: 'ins-7', nombre: 'Sprite 2L', unidad: 'botella', stock: 25, cantidadPorUnidad: 2000, stockMinimo: 10 },
            { id: 'ins-8', nombre: 'Hielo', unidad: 'kg', stock: 50, cantidadPorUnidad: 1000, stockMinimo: 20 },
            { id: 'ins-9', nombre: 'Huevos', unidad: 'unidad', stock: 60, cantidadPorUnidad: 1, stockMinimo: 20 },
            { id: 'ins-10', nombre: 'Cerveza Lata 355ml', unidad: 'lata', stock: 100, cantidadPorUnidad: 355, stockMinimo: 30 },
        ];

        // Productos de Venta
        const productos = [
            { id: 'prod-1', nombre: 'Pisco Sour', categoria: 'cocteles', precio: 25, imagen: '🍹' },
            { id: 'prod-2', nombre: 'Cuba Libre', categoria: 'cocteles', precio: 20, imagen: '🥃' },
            { id: 'prod-3', nombre: 'Vodka Tonic', categoria: 'cocteles', precio: 22, imagen: '🍸' },
            { id: 'prod-4', nombre: 'Cerveza', categoria: 'bebidas', precio: 8, imagen: '🍺' },
            { id: 'prod-5', nombre: 'Coca Cola', categoria: 'bebidas', precio: 5, imagen: '🥤' },
            { id: 'prod-6', nombre: 'Sprite', categoria: 'bebidas', precio: 5, imagen: '🥤' },
            { id: 'prod-7', nombre: 'Chilcano', categoria: 'cocteles', precio: 18, imagen: '🍹' },
        ];

        // Recetas (relación Producto -> Insumos)
        const recetas = [
            // Pisco Sour: 3oz Pisco (90ml), 1oz Jarabe (30ml), 1oz Limón (30ml), 1 Huevo, Hielo
            { id: 'rec-1', productoId: 'prod-1', insumoId: 'ins-1', cantidad: 90 },
            { id: 'rec-2', productoId: 'prod-1', insumoId: 'ins-5', cantidad: 30 },
            { id: 'rec-3', productoId: 'prod-1', insumoId: 'ins-4', cantidad: 30 },
            { id: 'rec-4', productoId: 'prod-1', insumoId: 'ins-9', cantidad: 1 },
            { id: 'rec-5', productoId: 'prod-1', insumoId: 'ins-8', cantidad: 100 },

            // Cuba Libre: 2oz Ron (60ml), Coca Cola (150ml), Hielo
            { id: 'rec-6', productoId: 'prod-2', insumoId: 'ins-2', cantidad: 60 },
            { id: 'rec-7', productoId: 'prod-2', insumoId: 'ins-6', cantidad: 150 },
            { id: 'rec-8', productoId: 'prod-2', insumoId: 'ins-8', cantidad: 100 },

            // Vodka Tonic: 2oz Vodka (60ml), Sprite (150ml), Hielo
            { id: 'rec-9', productoId: 'prod-3', insumoId: 'ins-3', cantidad: 60 },
            { id: 'rec-10', productoId: 'prod-3', insumoId: 'ins-7', cantidad: 150 },
            { id: 'rec-11', productoId: 'prod-3', insumoId: 'ins-8', cantidad: 100 },

            // Cerveza: 1 lata
            { id: 'rec-12', productoId: 'prod-4', insumoId: 'ins-10', cantidad: 355 },

            // Coca Cola: 250ml
            { id: 'rec-13', productoId: 'prod-5', insumoId: 'ins-6', cantidad: 250 },

            // Sprite: 250ml
            { id: 'rec-14', productoId: 'prod-6', insumoId: 'ins-7', cantidad: 250 },

            // Chilcano: 2oz Pisco (60ml), Sprite (150ml), Limón (20ml), Hielo
            { id: 'rec-15', productoId: 'prod-7', insumoId: 'ins-1', cantidad: 60 },
            { id: 'rec-16', productoId: 'prod-7', insumoId: 'ins-7', cantidad: 150 },
            { id: 'rec-17', productoId: 'prod-7', insumoId: 'ins-4', cantidad: 20 },
            { id: 'rec-18', productoId: 'prod-7', insumoId: 'ins-8', cantidad: 100 },
        ];

        // Mesas
        const mesas = Array.from({ length: 12 }, (_, i) => ({
            id: `mesa-${i + 1}`,
            numero: i + 1,
            estado: 'libre', // libre, ocupada, cuenta_pedida
            pedidoActualId: null,
        }));

        // Caja inicial
        const caja = {
            abierta: false,
            fechaApertura: null,
            montoInicial: 0,
            montoActual: 0,
            ventasTotales: 0,
            abiertaPor: null,
        };

        // Guardar todo
        this.save(STORAGE_KEYS.INSUMOS, insumos);
        this.save(STORAGE_KEYS.PRODUCTOS, productos);
        this.save(STORAGE_KEYS.RECETAS, recetas);
        this.save(STORAGE_KEYS.MESAS, mesas);
        this.save(STORAGE_KEYS.PEDIDOS, []);
        this.save(STORAGE_KEYS.CAJA, caja);
        this.save(STORAGE_KEYS.MERMAS, []);
        this.save(STORAGE_KEYS.VENTAS, []);
    }

    // Métodos específicos para cada entidad

    // Productos
    static getProductos() {
        return this.getAll(STORAGE_KEYS.PRODUCTOS);
    }

    static getProductoById(id) {
        return this.getById(STORAGE_KEYS.PRODUCTOS, id);
    }

    // Insumos
    static getInsumos() {
        return this.getAll(STORAGE_KEYS.INSUMOS);
    }

    static actualizarStockInsumo(insumoId, cantidad) {
        const insumos = this.getAll(STORAGE_KEYS.INSUMOS);
        const insumo = insumos.find(i => i.id === insumoId);
        if (insumo) {
            insumo.stock += cantidad;
            this.save(STORAGE_KEYS.INSUMOS, insumos);
        }
    }

    // Recetas
    static getRecetasByProducto(productoId) {
        const recetas = this.getAll(STORAGE_KEYS.RECETAS);
        return recetas.filter(r => r.productoId === productoId);
    }

    // Mesas
    static getMesas() {
        return this.getAll(STORAGE_KEYS.MESAS);
    }

    static getMesaById(id) {
        return this.getById(STORAGE_KEYS.MESAS, id);
    }

    static actualizarEstadoMesa(mesaId, estado, pedidoId = null) {
        this.update(STORAGE_KEYS.MESAS, mesaId, {
            estado,
            pedidoActualId: pedidoId,
        });
    }

    // Pedidos
    static getPedidos() {
        return this.getAll(STORAGE_KEYS.PEDIDOS);
    }

    static getPedidoById(id) {
        return this.getById(STORAGE_KEYS.PEDIDOS, id);
    }

    static crearPedido(mesaId, mesero = 'Sistema') {
        const pedido = {
            mesaId,
            mesero, // Mesero asignado
            items: [],
            total: 0,
            estado: 'abierto', // abierto, parcialmente_pagado, cerrado
            fechaCreacion: new Date().toISOString(),
            pagosParciales: [],
        };
        return this.add(STORAGE_KEYS.PEDIDOS, pedido);
    }

    static agregarItemPedido(pedidoId, productoId, cantidad) {
        const pedido = this.getPedidoById(pedidoId);
        const producto = this.getProductoById(productoId);

        if (!pedido || !producto) return null;

        const itemExistente = pedido.items.find(i => i.productoId === productoId);

        if (itemExistente) {
            itemExistente.cantidad += cantidad;
            itemExistente.subtotal = itemExistente.cantidad * itemExistente.precioUnitario;
        } else {
            pedido.items.push({
                id: this.generateId(),
                productoId,
                nombre: producto.nombre,
                cantidad,
                precioUnitario: producto.precio,
                subtotal: cantidad * producto.precio,
                pagado: false,
                estadoPreparacion: 'pendiente', // pendiente | preparando | listo
                horaAgregado: new Date().toISOString(),
            });
        }

        pedido.total = pedido.items.reduce((sum, item) => sum + item.subtotal, 0);
        this.update(STORAGE_KEYS.PEDIDOS, pedidoId, pedido);
        return pedido;
    }

    // Caja
    static getCaja() {
        const caja = localStorage.getItem(STORAGE_KEYS.CAJA);
        return caja ? JSON.parse(caja) : null;
    }

    static abrirCaja(montoInicial, usuario) {
        const caja = {
            abierta: true,
            fechaApertura: new Date().toISOString(),
            montoInicial,
            montoActual: montoInicial,
            ventasTotales: 0,
            abiertaPor: usuario,
        };
        this.save(STORAGE_KEYS.CAJA, caja);
        return caja;
    }

    static cerrarCaja() {
        const caja = this.getCaja();
        const cajaCerrada = {
            ...caja,
            abierta: false,
            fechaCierre: new Date().toISOString(),
        };
        this.save(STORAGE_KEYS.CAJA, cajaCerrada);

        // Guardar en historial de cierres
        const historial = this.getAll('historial_caja');
        historial.push(cajaCerrada);
        this.save('historial_caja', historial);

        return cajaCerrada;
    }

    static registrarVenta(monto) {
        const caja = this.getCaja();
        if (caja && caja.abierta) {
            caja.montoActual += monto;
            caja.ventasTotales += monto;
            this.save(STORAGE_KEYS.CAJA, caja);
        }
    }

    // Mermas
    static registrarMerma(insumoId, cantidad, motivo) {
        const merma = {
            insumoId,
            cantidad,
            motivo,
            fecha: new Date().toISOString(),
        };
        this.add(STORAGE_KEYS.MERMAS, merma);

        // Descontar del inventario
        this.actualizarStockInsumo(insumoId, -cantidad);
    }

    // Ventas (para métricas)
    static registrarVentaDetallada(venta) {
        const ventaCompleta = {
            ...venta,
            fecha: new Date().toISOString(),
        };
        this.add(STORAGE_KEYS.VENTAS, ventaCompleta);

        // Sincronizar a Supabase en background (no bloquea)
        this.sincronizarVentaSupabase(ventaCompleta);
    }

    static async sincronizarVentaSupabase(venta) {
        try {
            const { supabase } = await import('./supabase');
            await supabase.from('ventas').insert({
                pedido_id: venta.pedidoId,
                mesa_id: venta.mesaId,
                mesero: venta.mesero,
                subtotal: venta.subtotal,
                propina: venta.propina,
                total: venta.total,
                items: venta.items,
                fecha: venta.fecha,
            });
        } catch (e) {
            // Silencioso - LocalStorage es la fuente principal
        }
    }

    static getVentasHoy() {
        const ventas = this.getAll(STORAGE_KEYS.VENTAS);
        const hoy = new Date().toDateString();
        return ventas.filter(v => new Date(v.fecha).toDateString() === hoy);
    }

    static getVentasPorPeriodo(periodo = 'hoy') {
        const ventas = this.getAll(STORAGE_KEYS.VENTAS);
        const ahora = new Date();
        return ventas.filter(v => {
            const fechaVenta = new Date(v.fecha);
            if (periodo === 'hoy') return fechaVenta.toDateString() === ahora.toDateString();
            if (periodo === 'semana') {
                const hace7 = new Date(ahora); hace7.setDate(ahora.getDate() - 7);
                return fechaVenta >= hace7;
            }
            if (periodo === 'mes') {
                return fechaVenta.getMonth() === ahora.getMonth() && fechaVenta.getFullYear() === ahora.getFullYear();
            }
            return true;
        });
    }

    static getReporteEmpleados(periodo = 'hoy') {
        const ventas = this.getVentasPorPeriodo(periodo);
        const reporte = {};
        ventas.forEach(v => {
            const key = v.mesero || 'Sin asignar';
            if (!reporte[key]) reporte[key] = { nombre: key, ventas: 0, propinas: 0, pedidos: 0 };
            reporte[key].ventas += v.subtotal || 0;
            reporte[key].propinas += v.propina || 0;
            reporte[key].pedidos += 1;
        });
        return Object.values(reporte).sort((a, b) => b.ventas - a.ventas);
    }

    // Barman - Cola de pedidos
    static getPedidosPendientesBarman() {
        const pedidos = this.getAll(STORAGE_KEYS.PEDIDOS);
        return pedidos
            .filter(p => p.estado !== 'cerrado')
            .map(p => ({
                ...p,
                itemsPendientes: p.items.filter(i => !i.pagado && i.estadoPreparacion !== 'listo'),
            }))
            .filter(p => p.itemsPendientes.length > 0)
            .sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion));
    }

    static marcarItemPreparacion(pedidoId, itemId, estado) {
        const pedido = this.getPedidoById(pedidoId);
        if (!pedido) return null;
        pedido.items = pedido.items.map(item =>
            item.id === itemId ? { ...item, estadoPreparacion: estado } : item
        );
        return this.update(STORAGE_KEYS.PEDIDOS, pedidoId, pedido);
    }

    static contarItemsPendientesBarman() {
        const pedidos = this.getPedidosPendientesBarman();
        return pedidos.reduce((sum, p) => sum + p.itemsPendientes.length, 0);
    }
}

export default Database;
