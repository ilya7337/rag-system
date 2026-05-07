import React, { useState } from 'react';
import {
    AppBar, Toolbar, Typography, Button, Box, Avatar,
    Menu, MenuItem, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import {
    Logout, AdminPanelSettings, Person
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const handleLogout = async () => {
        await logout();
        navigate('/');
        handleMenuClose();
    };

    return (
        <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'background.paper' }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ cursor: 'pointer', fontWeight: 'bold', color: 'primary.main' }}
                    onClick={() => navigate('/')}
                >
                    База знаний
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {user ? (
                        <>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={handleMenuOpen}>
                                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                                    <Person sx={{ fontSize: 22 }} />
                                </Avatar>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.login}</Typography>
                            </Box>

                            <Menu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleMenuClose}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                slotProps={{
                                    paper: {
                                        elevation: 3,
                                        sx: { minWidth: 200, mt: 1 }
                                    }
                                }}
                            >
                                <MenuItem disabled>
                                    <ListItemIcon>
                                        <Person fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={user.login} secondary="Пользователь" />
                                </MenuItem>
                                <Divider />
                                {user.is_admin && (
                                    <MenuItem onClick={() => { navigate('/admin'); handleMenuClose(); }}>
                                        <ListItemIcon>
                                            <AdminPanelSettings fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Админ-панель" />
                                    </MenuItem>
                                )}
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon>
                                        <Logout fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Выйти" />
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <>
                            <Button color="primary" onClick={() => navigate('/login')}>
                                Вход
                            </Button>
                            <Button variant="contained" onClick={() => navigate('/register')}>
                                Регистрация
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};