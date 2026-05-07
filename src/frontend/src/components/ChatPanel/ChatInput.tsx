import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

interface ChatInputProps {
    onSend: (text: string) => void;
    loading: boolean;
    disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, loading, disabled }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSend(input);
        setInput('');
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, display: 'flex', gap: 1 }}>
            <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder={disabled ? "Войдите, чтобы задать вопрос" : "Задайте вопрос..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading || disabled}
            />
            <Button type="submit" variant="contained" disabled={loading || disabled} sx={{ minWidth: 48 }}>
                ➤
            </Button>
        </Box>
    );
};