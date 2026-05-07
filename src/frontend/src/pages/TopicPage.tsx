import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Typography, List, ListItem, ListItemText,
    IconButton, CircularProgress, Box, Button, ListItemButton
} from '@mui/material';
import { ArrowBack, Description } from '@mui/icons-material';
import * as api from '../api/services';
import type { Topic, Document } from '../types';
import { DocumentViewer } from '../components/DocumentViewer';
import { useAuth } from '../context/AuthContext';

export const TopicPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [topic, setTopic] = useState<Topic | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const { isAdmin } = useAuth();

    useEffect(() => {
        if (!id) return;
        Promise.all([api.topics.get(id), api.documents.listByTopic(id)])
            .then(([topicRes, docsRes]) => {
                setTopic(topicRes.data);
                setDocuments(docsRes.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
    if (!topic) return <Typography>Тема не найдена</Typography>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/')}><ArrowBack /></IconButton>
                <Typography variant="h4">{topic.title}</Typography>
                {isAdmin && <Button variant="outlined" onClick={() => navigate('/admin')}>Админка</Button>}
            </Box>
            <Typography variant="body1" component="p" sx={{ mb: 2 }}>
                {topic.description}
            </Typography>
            <Typography variant="h5" gutterBottom>Документы</Typography>
            <List>
                {documents.map(doc => (
                    <ListItem key={doc.id} disablePadding>
                        <ListItemButton onClick={() => setSelectedDocId(doc.id)}>
                            <Description sx={{ mr: 2 }} />
                            <ListItemText primary={doc.title} secondary={doc.description} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <DocumentViewer docId={selectedDocId} open={!!selectedDocId} onClose={() => setSelectedDocId(null)} />
        </Container>
    );
};