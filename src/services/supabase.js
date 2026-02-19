// Supabase Client Configuration
// IMPORTANT: Create a .env.local file with your Supabase credentials

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for authentication

/**
 * Sign up a new user
 */
export const signUp = async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: userData, // Additional user metadata
        },
    });

    if (error) throw error;
    return data;
};

/**
 * Sign in with email and password
 */
export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
};

/**
 * Sign out current user
 */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

/**
 * Get current session
 */
export const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
};

/**
 * Get current user
 */
export const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange(callback);
};

/**
 * Get user profile with role
 */
export const getUserProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
};

// Database helper functions

/**
 * Generic query builder
 */
export const query = (table) => supabase.from(table);

/**
 * Real-time subscription
 */
export const subscribe = (table, callback) => {
    return supabase
        .channel(`${table}_changes`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
        .subscribe();
};

export default supabase;
