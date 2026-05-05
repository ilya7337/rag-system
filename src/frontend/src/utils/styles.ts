import type { SxProps, Theme } from '@mui/material/styles';

export const focusedFieldsetStyle: SxProps<Theme> = (theme) => ({
    '& .MuiOutlinedInput-root.Mui-focused': {
        '& fieldset': {
            borderColor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.3)'
                : 'rgba(0, 0, 0, 0.15)',
            borderWidth: '1.5px',
            borderRadius: '5px',
        },
    },
    '& .MuiOutlinedInput-root:hover:not(.Mui-focused)': {
        '& fieldset': {
            borderColor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(0, 0, 0, 0.25)',
        },
    },
});

export const formContainerStyle: SxProps<Theme> = {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    width: '100%',
    minWidth: '400px',
    maxWidth: '500px',
    mx: 'auto',
};

export const formSectionStyle: SxProps<Theme> = {
    m: 1,
};

export const formLabelStyle: SxProps<Theme> = {
    fontWeight: 'bold',
    mb: 1,
    textAlign: 'left',
};

export const submitButtonStyle: SxProps<Theme> = {
    borderRadius: '15px',
    py: 1.5,
    fontSize: '1rem',
    fontWeight: 'bold',
    textTransform: 'none',
    mt: 2,
};