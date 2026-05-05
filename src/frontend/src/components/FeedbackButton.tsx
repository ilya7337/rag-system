import React, { useState } from 'react';
import { IconButton, Modal, Box, TextField, Button, Typography } from '@mui/material';
import { Feedback as FeedbackIcon } from '@mui/icons-material';
import * as api from '../api/services';

const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 4,
};

export const FeedbackButton: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!text.trim()) return;
        setSending(true);
        try {
            await api.feedback.create(text);
            setText('');
            setOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <IconButton onClick={() => setOpen(true)} sx={{ position: 'fixed', bottom: 24, right: 24, bgcolor: 'secondary.main', color: 'white', '&:hover': { bgcolor: 'secondary.dark' } }}>
                <FeedbackIcon />
            </IconButton>
            <Modal open={open} onClose={() => setOpen(false)}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" gutterBottom>Обратная связь</Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Ваш комментарий..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={sending}
                        sx={{ mb: 2 }}
                    />
                    <Button variant="contained" onClick={handleSend} disabled={sending}>Отправить</Button>
                </Box>
            </Modal>
        </>
    );
};