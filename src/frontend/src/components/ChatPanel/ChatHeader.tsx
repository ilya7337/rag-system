import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Close as CloseIcon, History as HistoryIcon, AddCircle } from '@mui/icons-material';

interface ChatHeaderProps {
    onClose: () => void;
    onToggleHistory: () => void;
    onNewChat: () => void;
    showHistory: boolean;
    isAuthenticated: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    onClose,
    onToggleHistory,
    onNewChat,
    showHistory,
    isAuthenticated,
}) => {
    return (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">AI помощник</Typography>
            <Box>
                <Tooltip title="История">
                    <IconButton onClick={onToggleHistory} disabled={!isAuthenticated}>
                        <HistoryIcon color={showHistory ? 'primary' : 'inherit'} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Новый чат">
                    <IconButton onClick={onNewChat} disabled={!isAuthenticated}>
                        <AddCircle />
                    </IconButton>
                </Tooltip>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>
        </Box>
    );
};