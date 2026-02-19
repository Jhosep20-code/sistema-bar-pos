import { Users, Clock, User } from 'lucide-react';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente de cuadrícula de mesas con estados visuales
 * - Meseros solo ven sus mesas asignadas
 * - Admin/Gerente ven todas las mesas
 */
const TablesGrid = ({ mesas, onSeleccionarMesa }) => {
    const { profile } = useAuth();
    const isAdminOrManager = profile?.role === 'admin' || profile?.role === 'gerente';
    const isBarman = profile?.role === 'barman';

    // Barman no puede seleccionar mesas, solo ve el estado
    const puedeSeleccionar = !isBarman;

    const getEstadoClasses = (estado, esPropiaMesa) => {
        const baseClasses = 'aspect-square rounded-xl border-2 transition-all duration-300';
        const interactivo = puedeSeleccionar ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default opacity-80';

        switch (estado) {
            case 'libre':
                return `${baseClasses} ${interactivo} bg-dark-card border-dark-border text-lead hover:border-gold/30`;
            case 'ocupada':
                return `${baseClasses} ${interactivo} ${esPropiaMesa ? 'bg-white/10 border-white/50' : 'bg-white/5 border-white/20'} text-white hover:border-white`;
            case 'cuenta_pedida':
                return `${baseClasses} ${interactivo} bg-gold/10 border-gold text-gold hover:border-gold hover:bg-gold/20`;
            default:
                return baseClasses;
        }
    };

    const getEstadoLabel = (estado) => {
        const labels = {
            libre: 'Libre',
            ocupada: 'Ocupada',
            cuenta_pedida: 'Cuenta Pedida',
        };
        return labels[estado] || estado;
    };

    // Filtrar mesas según rol
    const mesasFiltradas = isAdminOrManager || isBarman
        ? mesas
        : mesas.filter(m =>
            m.estado === 'libre' ||
            m.meseroAsignado === profile?.nombre ||
            m.meseroAsignado === profile?.email
        );

    return (
        <div className="p-4">
            {/* Leyenda */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-dark-card border-2 border-dark-border"></div>
                    <span className="text-lead">Libre</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-white/5 border-2 border-white/30"></div>
                    <span className="text-white">Ocupada</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gold/10 border-2 border-gold"></div>
                    <span className="text-gold">Cuenta Pedida</span>
                </div>
                {!isAdminOrManager && !isBarman && (
                    <div className="ml-auto text-xs text-lead bg-dark-card border border-dark-border px-3 py-1 rounded-lg">
                        Solo ves tus mesas asignadas
                    </div>
                )}
            </div>

            {/* Grid de Mesas */}
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {mesasFiltradas.map((mesa) => {
                    const esPropiaMesa = mesa.meseroAsignado === profile?.nombre;
                    return (
                        <button
                            key={mesa.id}
                            onClick={() => puedeSeleccionar && onSeleccionarMesa(mesa.id)}
                            className={getEstadoClasses(mesa.estado, esPropiaMesa)}
                            disabled={!puedeSeleccionar}
                        >
                            <div className="flex flex-col items-center justify-center h-full p-2">
                                <div className="text-2xl sm:text-3xl font-bold mb-1">
                                    {mesa.numero}
                                </div>
                                <div className="text-xs opacity-70 flex items-center gap-1">
                                    {mesa.estado === 'libre' ? (
                                        <Users size={12} />
                                    ) : (
                                        <Clock size={12} />
                                    )}
                                    <span className="hidden sm:inline">
                                        {getEstadoLabel(mesa.estado)}
                                    </span>
                                </div>
                                {/* Mostrar mesero asignado */}
                                {mesa.meseroAsignado && mesa.estado !== 'libre' && (
                                    <div className="mt-1 flex items-center gap-0.5 text-[10px] opacity-60 max-w-full">
                                        <User size={9} />
                                        <span className="truncate max-w-[60px]">{mesa.meseroAsignado.split(' ')[0]}</span>
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {mesasFiltradas.length === 0 && (
                <div className="text-center py-12 text-lead">
                    <Users size={48} className="mx-auto mb-3 opacity-30" />
                    <p>No tienes mesas asignadas actualmente</p>
                </div>
            )}
        </div>
    );
};

TablesGrid.propTypes = {
    mesas: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            numero: PropTypes.number.isRequired,
            estado: PropTypes.oneOf(['libre', 'ocupada', 'cuenta_pedida']).isRequired,
            pedidoActualId: PropTypes.string,
            meseroAsignado: PropTypes.string,
        })
    ).isRequired,
    onSeleccionarMesa: PropTypes.func.isRequired,
};

export default TablesGrid;
