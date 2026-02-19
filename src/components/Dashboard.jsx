import { useState } from 'react';
import { DollarSign, TrendingUp, Clock, Award, User, Users, Calendar, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import Database from '../services/database';

/**
 * Dashboard con métricas, gráficos y reportes por empleado
 * - Admin/Gerente: Ve todas las ventas + reporte por empleado
 * - Mesero/Barman: Ve solo sus ventas
 */
const Dashboard = () => {
    const { profile } = useAuth();
    const isAdminOrManager = profile?.role === 'admin' || profile?.role === 'gerente';
    const [periodo, setPeriodo] = useState('hoy');

    // Obtener ventas según rol y período
    const todasLasVentas = Database.getVentasPorPeriodo(periodo);
    const ventas = isAdminOrManager
        ? todasLasVentas
        : todasLasVentas.filter(v => v.mesero === profile?.nombre || v.mesero === profile?.email);

    const caja = Database.getCaja();

    // Reporte por empleado (solo admin)
    const reporteEmpleados = isAdminOrManager ? Database.getReporteEmpleados(periodo) : [];

    // Agregar ventas por hora
    const ventasPorHora = Array.from({ length: 24 }, (_, i) => {
        const ventasHora = ventas.filter(v => new Date(v.fecha).getHours() === i);
        return {
            hora: `${i}:00`,
            ventas: ventasHora.reduce((sum, v) => sum + v.total, 0),
        };
    }).filter(h => h.ventas > 0);

    // Top 5 productos más vendidos
    const productosVendidos = {};
    ventas.forEach(venta => {
        (venta.items || []).forEach(item => {
            if (!productosVendidos[item.nombre]) {
                productosVendidos[item.nombre] = { nombre: item.nombre, cantidad: 0, total: 0 };
            }
            productosVendidos[item.nombre].cantidad += item.cantidad;
            productosVendidos[item.nombre].total += item.cantidad * item.precio;
        });
    });

    const topProductos = Object.values(productosVendidos)
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

    const totalVentasHoy = ventas.reduce((sum, v) => sum + v.total, 0);
    const totalPropinas = ventas.reduce((sum, v) => sum + (v.propina || 0), 0);
    const numeroVentas = ventas.length;
    const promedioVenta = numeroVentas > 0 ? totalVentasHoy / numeroVentas : 0;

    const periodoLabels = { hoy: 'Hoy', semana: 'Esta Semana', mes: 'Este Mes' };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            {/* Header con filtro de período */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        {isAdminOrManager ? '📊 Métricas del Negocio' : '📈 Mis Ventas'}
                    </h2>
                    {!isAdminOrManager && (
                        <div className="flex items-center gap-2 mt-1">
                            <User size={14} className="text-gold" />
                            <span className="text-sm text-gold font-medium">{profile?.nombre}</span>
                        </div>
                    )}
                </div>

                {/* Selector de período */}
                <div className="flex items-center gap-2 bg-dark-card border border-dark-border rounded-xl p-1">
                    <Calendar size={16} className="text-lead ml-2" />
                    {['hoy', 'semana', 'mes'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriodo(p)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${periodo === p
                                ? 'bg-gold text-dark-bg'
                                : 'text-lead hover:text-white'
                                }`}
                        >
                            {periodoLabels[p]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tarjetas de Resumen */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gold/10 rounded-lg">
                            <DollarSign size={22} className="text-gold" />
                        </div>
                        <div className="text-sm text-lead">
                            {isAdminOrManager ? 'Total Ventas' : 'Mis Ventas'}
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gold">S/ {totalVentasHoy.toFixed(2)}</div>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <TrendingUp size={22} className="text-blue-400" />
                        </div>
                        <div className="text-sm text-lead">Pedidos</div>
                    </div>
                    <div className="text-2xl font-bold text-white">{numeroVentas}</div>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Award size={22} className="text-green-400" />
                        </div>
                        <div className="text-sm text-lead">Propinas</div>
                    </div>
                    <div className="text-2xl font-bold text-green-400">S/ {totalPropinas.toFixed(2)}</div>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Clock size={22} className="text-purple-400" />
                        </div>
                        <div className="text-sm text-lead">Caja</div>
                    </div>
                    <div className="text-2xl font-bold">
                        {caja?.abierta
                            ? <span className="text-green-400">Abierta</span>
                            : <span className="text-red-400">Cerrada</span>
                        }
                    </div>
                </div>
            </div>

            {/* Reporte por Empleado - Solo Admin/Gerente */}
            {isAdminOrManager && reporteEmpleados.length > 0 && (
                <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Users size={20} className="text-gold" />
                        <h3 className="text-lg font-bold text-white">Rendimiento por Empleado</h3>
                        <span className="text-xs text-lead bg-dark-bg px-2 py-1 rounded-lg ml-auto">
                            {periodoLabels[periodo]}
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-lead border-b border-dark-border">
                                    <th className="text-left py-2 pr-4">Empleado</th>
                                    <th className="text-right py-2 px-4">Pedidos</th>
                                    <th className="text-right py-2 px-4">Ventas</th>
                                    <th className="text-right py-2 px-4">Propinas</th>
                                    <th className="text-right py-2 pl-4">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reporteEmpleados.map((emp, i) => (
                                    <tr key={emp.nombre} className="border-b border-dark-border/50 hover:bg-dark-bg/50 transition-colors">
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-gold/20 text-gold' : 'bg-dark-bg text-lead'}`}>
                                                    {emp.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-white font-medium">{emp.nombre}</span>
                                                {i === 0 && <span className="text-xs text-gold">🏆</span>}
                                            </div>
                                        </td>
                                        <td className="text-right py-3 px-4 text-white">{emp.pedidos}</td>
                                        <td className="text-right py-3 px-4 text-white">S/ {emp.ventas.toFixed(2)}</td>
                                        <td className="text-right py-3 px-4 text-green-400">S/ {emp.propinas.toFixed(2)}</td>
                                        <td className="text-right py-3 pl-4 font-bold text-gold">
                                            S/ {(emp.ventas + emp.propinas).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Gráfico de Ventas por Hora */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Ventas por Hora</h3>
                {ventasPorHora.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={ventasPorHora}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                            <XAxis dataKey="hora" stroke="#8B8B8B" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#8B8B8B" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1A1A1A',
                                    border: '1px solid #2C2C2C',
                                    borderRadius: '8px',
                                    color: '#fff',
                                }}
                                formatter={(v) => [`S/ ${v.toFixed(2)}`, 'Ventas']}
                            />
                            <Bar dataKey="ventas" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center py-12 text-lead">
                        <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
                        <p>{isAdminOrManager ? 'No hay datos de ventas para este período' : 'No has realizado ventas en este período'}</p>
                    </div>
                )}
            </div>

            {/* Top 5 Productos */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Top 5 Productos Más Vendidos</h3>
                {topProductos.length > 0 ? (
                    <div className="space-y-3">
                        {topProductos.map((producto, index) => (
                            <div
                                key={producto.nombre}
                                className="flex items-center gap-4 p-3 bg-dark-bg rounded-xl"
                            >
                                <div className={`text-2xl font-bold w-8 ${index === 0 ? 'text-gold' : 'text-lead'}`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-white">{producto.nombre}</div>
                                    <div className="text-sm text-lead">{producto.cantidad} unidades</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gold">S/ {producto.total.toFixed(2)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-lead">
                        <Award size={40} className="mx-auto mb-3 opacity-30" />
                        <p>{isAdminOrManager ? 'No hay productos vendidos en este período' : 'No has vendido productos en este período'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
