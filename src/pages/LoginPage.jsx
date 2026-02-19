import { useState } from 'react';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import PropTypes from 'prop-types';
import { signIn } from '../services/supabase';

/**
 * Página de Login con autenticación Supabase
 */
const LoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { session, user } = await signIn(email, password);

            if (session && user) {
                onLoginSuccess(user);
            }
        } catch (err) {
            console.error('Login error:', err);

            if (err.message.includes('Invalid login credentials')) {
                setError('Email o contraseña incorrectos');
            } else if (err.message.includes('Email not confirmed')) {
                setError('Por favor confirma tu email antes de iniciar sesión');
            } else {
                setError('Error al iniciar sesión. Intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gold mb-2">
                        🔥 FUEGO EN LA NOCHE
                    </h1>
                    <p className="text-lead">Sistema de Gestión POS</p>
                </div>

                {/* Login Form */}
                <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Iniciar Sesión</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm text-lead mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="usuario@bar.com"
                                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder:text-lead/50 focus:border-gold outline-none transition-colors"
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm text-lead mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 pr-12 text-white placeholder:text-lead/50 focus:border-gold outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lead hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ${loading
                                ? 'bg-dark-border text-lead cursor-not-allowed'
                                : 'bg-gold text-dark-bg hover:bg-gold/90 active:scale-95'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin"></div>
                                    Iniciando sesión...
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    Iniciar Sesión
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials (remove in production) */}
                    <div className="mt-6 p-4 bg-dark-bg border border-dark-border rounded-lg">
                        <p className="text-xs text-lead mb-2">Credenciales Demo:</p>
                        <div className="text-xs text-white space-y-1">
                            <p>Admin: <span className="text-gold">admin@bar.com</span> / admin123</p>
                            <p>Gerente: <span className="text-gold">gerente@bar.com</span> / gerente123</p>
                            <p>Barman: <span className="text-gold">barman@bar.com</span> / barman123</p>
                            <p>Mesero: <span className="text-gold">mesero@bar.com</span> / mesero123</p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-sm text-lead mt-6">
                    ¿Olvidaste tu contraseña? Contacta al administrador
                </p>
            </div>
        </div>
    );
};

LoginPage.propTypes = {
    onLoginSuccess: PropTypes.func.isRequired,
};

export default LoginPage;
