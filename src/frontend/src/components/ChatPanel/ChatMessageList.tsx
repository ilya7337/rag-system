import React from 'react';
import { Box, Stack, CircularProgress } from '@mui/material';
import { ChatMessageItem } from './ChatMessageItem';
import type { ChatMessage } from '../../types';

interface ChatMessageListProps {
    messages: ChatMessage[];
    loading: boolean;
    isAuthenticated: boolean;
    onRate: (messageId: string, liked: boolean) => void;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
    messages,
    loading,
    isAuthenticated,
    onRate,
    messagesEndRef,
}) => {
    return (
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            <Stack spacing={2}>
                {messages.map((msg) => (
                    <ChatMessageItem
                        key={msg.id}
                        message={msg}
                        isAuthenticated={isAuthenticated}
                        onRate={onRate}
                    />
                ))}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <CircularProgress size={24} />
                    </Box>
                )}
                <div ref={messagesEndRef} />
            </Stack>
        </Box>
    );
};