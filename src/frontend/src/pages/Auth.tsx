import { useState } from 'react';
import { Alert, Container, Link, Paper, Typography, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import type { LoginFormData, RegisterFormData } from '../utils/validation';
import { LoginForm } from '../components/Auth/LoginForm';
import { RegisterForm } from '../components/Auth/RegisterForm';

export default function Auth() {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const isLogin = location.pathname === '/login';

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLoginSubmit = async (data: LoginFormData) => {
        setError('');
        setLoading(true);
        try {
            await login(data.login, data.password);
            navigate(from, { replace: true });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Ошибка входа');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (data: RegisterFormData) => {
        setError('');
        setLoading(true);
        try {
            await register(data.login, data.password);
            navigate(from, { replace: true });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    };

    const switchToLogin = () => navigate('/login');
    const switchToRegister = () => navigate('/register');

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper sx={{ p: 5, borderRadius: '30px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
                    {isLogin ? 'Вход' : 'Регистрация'}
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {isLogin ? (
                    <LoginForm onSubmit={handleLoginSubmit} loading={loading} error={error} />
                ) : (
                    <RegisterForm onSubmit={handleRegisterSubmit} loading={loading} error={error} />
                )}

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    {isLogin ? (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Link component="button" type="button" onClick={switchToRegister}>
                                Зарегистрироваться
                            </Link>
                            <Link href="#" variant="body2">Забыли пароль?</Link>
                        </Box>
                    ) : (
                        <Link component="button" type="button" onClick={switchToLogin}>
                            Уже есть аккаунт?
                        </Link>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}