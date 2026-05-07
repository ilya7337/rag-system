import React, { useState } from 'react';
import { Tabs, Tab, Box, Container, Typography } from '@mui/material';
import { KnowledgeBase } from './KnowledgeBase';
import { RequestsLogs } from './RequestsLogs';
import { FeedbackList } from './FeedbackList';

export const AdminPanel: React.FC = () => {
    const [tab, setTab] = useState(0);
    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Административная панель</Typography>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab label="База знаний" />
                <Tab label="Запросы" />
                <Tab label="Отзывы" />
            </Tabs>
            <Box>
                {tab === 0 && <KnowledgeBase />}
                {tab === 1 && <RequestsLogs />}
                {tab === 2 && <FeedbackList />}
            </Box>
        </Container>
    );
};