import React from 'react';
import { Box, Paper, Typography, IconButton, Stack } from '@mui/material';
import { ThumbUp, ThumbDown, ContentCopy } from '@mui/icons-material';
import type { ChatMessage } from '../../types';

interface Props {
    message: ChatMessage;
    isAuthenticated: boolean;
    onRate: (id: string, liked: boolean) => void;
}

export const ChatMessageItem: React.FC<Props> = ({ message, isAuthenticated, onRate }) => {
    const isUser = message.role === 'user';
    return (
        <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
            <Paper sx={{
                p: 1.5,
                maxWidth: '80%',
                bgcolor: isUser ? 'primary.light' : 'grey.100',
                color: isUser ? 'white' : 'text.primary',
                borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px'
            }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{message.content}</Typography>
                {!isUser && message.id !== 'err' && isAuthenticated && (
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <IconButton size="small" onClick={() => onRate(message.id, true)} color={message.liked === true ? 'primary' : 'default'}>
                            <ThumbUp fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => onRate(message.id, false)} color={message.liked === false ? 'error' : 'default'}>
                            <ThumbDown fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => navigator.clipboard.writeText(message.content)}>
                            <ContentCopy fontSize="small" />
                        </IconButton>
                    </Stack>
                )}
            </Paper>
        </Box>
    );
};