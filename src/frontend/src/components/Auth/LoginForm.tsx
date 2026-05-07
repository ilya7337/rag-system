import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema, type LoginFormData } from '../../utils/validation';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { formContainerStyle, formLabelStyle, formSectionStyle, focusedFieldsetStyle, submitButtonStyle } from '../../utils/styles';

interface LoginFormProps {
    onSubmit: (data: LoginFormData) => void;
    loading: boolean;
    error?: string;
}

export function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
    const { register, handleSubmit, formState: { errors, isValid } } = useForm<LoginFormData>({
        resolver: yupResolver(loginSchema),
        mode: 'onChange',
    });

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={formContainerStyle}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box sx={formSectionStyle}>
                <Typography variant="body2" sx={formLabelStyle}>Логин:</Typography>
                <TextField
                    placeholder="Введите логин"
                    {...register('login')}
                    error={!!errors.login}
                    helperText={errors.login?.message}
                    disabled={loading}
                    fullWidth
                    sx={focusedFieldsetStyle}
                />
            </Box>
            <Box sx={formSectionStyle}>
                <Typography variant="body2" sx={formLabelStyle}>Пароль:</Typography>
                <TextField
                    type="password"
                    placeholder="Введите пароль"
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={loading}
                    fullWidth
                    sx={focusedFieldsetStyle}
                />
            </Box>
            <Button
                type="submit"
                variant="contained"
                disabled={!isValid || loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                fullWidth
                sx={submitButtonStyle}
            >
                {loading ? 'Вход...' : 'Войти'}
            </Button>
        </Box>
    );
}