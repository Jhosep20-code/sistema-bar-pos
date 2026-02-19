import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getUser, getUserProfile, onAuthStateChange, signOut as supabaseSignOut } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session on mount
        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);
                await loadUserProfile(session.user);
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const checkUser = async () => {
        try {
            const currentUser = await getUser();

            if (currentUser) {
                setUser(currentUser);
                await loadUserProfile(currentUser);
            } else {
                setUser(null);
                setProfile(null);
            }
        } catch (error) {
            // Silent fail - auth session not ready yet
            setUser(null);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const loadUserProfile = async (currentUser) => {
        if (!currentUser) return;

        // ALWAYS create a basic profile first from user data
        const basicProfile = {
            id: currentUser.id,
            email: currentUser.email,
            nombre: currentUser.user_metadata?.nombre || currentUser.email?.split('@')[0] || 'Usuario',
            role: currentUser.user_metadata?.role || 'mesero',
        };

        setProfile(basicProfile);

        // Then try to load from database (optional, won't block) with timeout
        try {
            // Add 3-second timeout
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Database timeout')), 3000)
            );

            const dbProfilePromise = getUserProfile(currentUser.id);
            const dbProfile = await Promise.race([dbProfilePromise, timeoutPromise]);

            // Merge database profile with basic profile
            setProfile({
                ...basicProfile,
                ...dbProfile,
            });
        } catch (error) {
            // Keep the basic profile we already set
        }
    };

    const signOut = async () => {
        try {
            await supabaseSignOut();
            setUser(null);
            setProfile(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const value = {
        user,
        profile,
        loading,
        signOut,
        isAuthenticated: !!user,
        role: profile?.role || null,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AuthContext;
