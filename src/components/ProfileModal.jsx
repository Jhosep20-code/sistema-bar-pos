import { useState } from 'react';
import { X, User, Save } from 'lucide-react';
import PropTypes from 'prop-types';
import { supabase } from '../services/supabase';
import { useToast } from './Toast';

/**
 * Modal para editar perfil de usuario
 * Permite a meseros y barman cambiar su nombre
 */
const ProfileModal = ({ profile, onClose, onUpdate }) => {
    const [nombre, setNombre] = useState(profile?.nombre || '');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleSave = async () => {
        if (!nombre.trim()) {
            showToast('El nombre no puede estar vacío', 'warning');
            return;
        }

        if (!profile?.id) {
            showToast('Error: ID de perfil no encontrado', 'error');
            return;
        }

        setLoading(true);

        try {
            const { data, error: updateError } = await supabase
                .from('profiles')
                .update({ nombre: nombre.trim() })
                .eq('id', profile.id)
                .select();

            if (updateError) {
                throw updateError;
            }

            if (data && data.length > 0) {
                showToast('¡Perfil actualizado exitosamente!', 'success');
                onUpdate({ ...profile, nombre: nombre.trim() });
                setTimeout(onClose, 1000);
            } else {
                throw new Error('No data returned from update');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            showToast(`Error al actualizar perfil: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-dark-card border border-dark-border rounded-2xl max-w-md w-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gold/20 border border-gold rounded-full flex items-center justify-center">
                            <User size={24} className="text-gold" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Mi Perfil</h3>
                            <p className="text-sm text-lead capitalize">{profile?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Email (no editable) */}
                <div className="mb-4">
                    <label className="block text-sm text-lead mb-2">Email</label>
                    <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-lead cursor-not-allowed"
                    />
                </div>

                {/* Nombre (editable) */}
                <div className="mb-6">
                    <label className="block text-sm text-lead mb-2">Nombre</label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Tu nombre"
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder:text-lead/50 focus:border-gold outline-none transition-colors"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-lg font-medium bg-dark-bg border border-dark-border text-white hover:border-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !nombre.trim()}
                        className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${loading || !nombre.trim()
                            ? 'bg-dark-border text-lead cursor-not-allowed'
                            : 'bg-gold text-dark-bg hover:bg-gold/90'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin"></div>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Guardar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

ProfileModal.propTypes = {
    profile: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default ProfileModal;
