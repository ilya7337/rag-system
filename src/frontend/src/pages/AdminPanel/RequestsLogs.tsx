import React, { useEffect, useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, List, CircularProgress, Alert, Box } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import * as api from '../../api/services';
import type { LogEntry } from '../../types';

export const RequestsLogs: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.admin.logs()
            .then(res => {
                if (res.data && Array.isArray(res.data.items)) {
                    setLogs(res.data.items);
                } else {
                    console.warn('Неожиданный формат ответа', res.data);
                    setLogs([]);
                }
            })
            .catch(err => {
                console.error(err);
                setError(err.response?.data?.detail || 'Не удалось загрузить логи');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
    if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
    if (logs.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    Нет записей. Напишите несколько сообщений в чат, и они появятся здесь.
                </Typography>
            </Box>
        );
    }

    return (
        <List>
            {logs.map(log => (
                <Accordion key={log.id}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>
                            {new Date(log.created_at).toLocaleString()} —
                            {log.query ? (log.query.length > 50 ? log.query.substring(0, 50) + '...' : log.query) : 'Пустой запрос'}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography><strong>Вопрос:</strong> {log.query || '—'}</Typography>
                        <Typography><strong>Ответ:</strong> {log.response || '—'}</Typography>
                        <Typography variant="caption">Анонимный: {log.is_anonymous ? 'Да' : 'Нет'}</Typography>
                    </AccordionDetails>
                </Accordion>
            ))}
        </List>
    );
};