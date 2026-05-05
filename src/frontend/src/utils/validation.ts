import * as yup from 'yup';

export const registerSchema = yup.object({
    login: yup
        .string()
        .min(3, 'Логин должен содержать минимум 3 символа')
        .max(50, 'Логин не длиннее 50 символов')
        .required('Логин обязателен'),
    password: yup
        .string()
        .min(8, 'Пароль должен содержать минимум 8 символов')
        .matches(/\d/, 'Пароль должен содержать хотя бы одну цифру')
        .required('Пароль обязателен'),
});
export type RegisterFormData = yup.InferType<typeof registerSchema>;

export const loginSchema = yup.object({
    login: yup.string().required('Логин обязателен'),
    password: yup.string().required('Пароль обязателен'),
});
export type LoginFormData = yup.InferType<typeof loginSchema>;