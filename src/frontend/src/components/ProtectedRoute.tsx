import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';
import type { JSX } from 'react';

export const ProtectedRoute: React.FC<{ children: JSX.Element; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
    const { user, loading, isAdmin } = useAuth();
    if (loading) return 
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
    </Box>;
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && !isAdmin) return <Navigate to="/" />;
    return children;
};