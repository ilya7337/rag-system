import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema, type RegisterFormData } from '../../utils/validation';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { formContainerStyle, formLabelStyle, formSectionStyle, focusedFieldsetStyle, submitButtonStyle } from '../../utils/styles';

interface RegisterFormProps {
    onSubmit: (data: RegisterFormData) => void;
    loading: boolean;
    error?: string;
}

export function RegisterForm({ onSubmit, loading, error }: RegisterFormProps) {
    const { register, handleSubmit, formState: { errors, isValid } } = useForm<RegisterFormData>({
        resolver: yupResolver(registerSchema),
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
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
        </Box>
    );
}