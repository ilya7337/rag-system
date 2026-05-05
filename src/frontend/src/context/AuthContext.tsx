import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '../types';
import * as api from '../api/services';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAdmin: boolean;
    isAuthenticated: boolean;  
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        try {
            const response = await api.auth.getMe();
            setUser(response.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = async (username: string, password: string) => {
        const response = await api.auth.login(username, password);
        localStorage.setItem('access_token', response.data.access_token);
        await loadUser();
    };

    const register = async (username: string, password: string) => {
        await api.auth.register(username, password);
        await login(username, password);
    };

    const logout = async () => {
        await api.auth.logout();
        localStorage.removeItem('access_token');
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.is_admin ?? false,
        isAuthenticated: !!user && !!localStorage.getItem('access_token'), 
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};