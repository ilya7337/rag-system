import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, CircularProgress, Box, Typography } from '@mui/material';
import type { Feedback } from '../../types';

export const FeedbackList: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Эмуляция загрузки (в реальности здесь будет GET-запрос к API)
        const loadFeedbacks = async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            const stored = localStorage.getItem('feedback_list');
            if (stored) {
                setFeedbacks(JSON.parse(stored));
            }
            setLoading(false);
        };
        loadFeedbacks();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (feedbacks.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
                    Нет отзывов
                </Typography>
            </Box>
        );
    }

    return (
        <List>
            {feedbacks.map(fb => (
                <ListItem key={fb.id}>
                    <ListItemText
                        primary={fb.text}
                        secondary={new Date(fb.created_at).toLocaleString()}
                    />
                </ListItem>
            ))}
        </List>
    );
};