import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Typography, IconButton, Modal, TextField, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import { Add, Edit, Delete, ExpandMore, Upload, Language } from '@mui/icons-material';
import * as api from '../../api/services';
import type { Topic, Document } from '../../types';

export const KnowledgeBase: React.FC = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [openTopicModal, setOpenTopicModal] = useState(false);
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
    const [topicTitle, setTopicTitle] = useState('');
    const [topicDesc, setTopicDesc] = useState('');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [urlOpen, setUrlOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [docTitle, setDocTitle] = useState('');
    const [docDesc, setDocDesc] = useState('');
    const [docFile, setDocFile] = useState<File | null>(null);
    const [urlValue, setUrlValue] = useState('');
    const [urlTitle, setUrlTitle] = useState('');
    const [urlDesc, setUrlDesc] = useState('');
    const [urlLoading, setUrlLoading] = useState(false);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [documents, setDocuments] = useState<Record<string, Document[]>>({});

    const loadTopics = async () => {
        const res = await api.topics.list();
        setTopics(res.data.items);
        res.data.items.forEach(t => loadDocuments(t.id));
    };

    const loadDocuments = async (topicId: string) => {
        const res = await api.documents.listByTopic(topicId);
        setDocuments(prev => ({ ...prev, [topicId]: res.data }));
    };

    useEffect(() => { loadTopics(); }, []);

    const handleSaveTopic = async () => {
        if (editingTopic) {
            await api.topics.update(editingTopic.id, { title: topicTitle, description: topicDesc });
        } else {
            await api.topics.create({ title: topicTitle, description: topicDesc });
        }
        setOpenTopicModal(false);
        loadTopics();
    };

    const handleDeleteTopic = async (id: string) => {
        if (window.confirm('Удалить тему?')) {
            await api.topics.delete(id);
            loadTopics();
        }
    };

    const handleUpload = async () => {
        if (!selectedTopic || !docFile || !docTitle) return;
        const formData = new FormData();
        formData.append('title', docTitle);
        if (docDesc) formData.append('description', docDesc);
        formData.append('pdf_file', docFile);
        await api.documents.upload(selectedTopic.id, formData);
        setUploadOpen(false);
        loadDocuments(selectedTopic.id);
        setDocTitle('');
        setDocDesc('');
        setDocFile(null);
    };

    const handleUrlImport = async () => {
        if (!selectedTopic || !urlValue) return;
        setUrlLoading(true);
        setUrlError(null);
        try {
            await api.documents.fromUrl(selectedTopic.id, {
                url: urlValue,
                title: urlTitle || undefined,
                description: urlDesc || undefined,
            });
            setUrlOpen(false);
            setUrlValue('');
            setUrlTitle('');
            setUrlDesc('');
            loadDocuments(selectedTopic.id);
        } catch (err: any) {
            const msg = err?.response?.data?.detail || 'Ошибка при загрузке страницы';
            setUrlError(msg);
        } finally {
            setUrlLoading(false);
        }
    };

    const handleDeleteDoc = async (docId: string, topicId: string) => {
        if (window.confirm('Удалить документ?')) {
            await api.documents.delete(docId);
            loadDocuments(topicId);
        }
    };

    return (
        <Box>
            <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingTopic(null); setTopicTitle(''); setTopicDesc(''); setOpenTopicModal(true); }}>
                Создать тему
            </Button>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                {topics.map(topic => (
                    <Card key={topic.id}>
                        <CardContent>
                            <Typography variant="h6">{topic.title}</Typography>
                            <Typography variant="body2">{topic.description}</Typography>
                            <Box sx={{ mt: 1 }}>
                                <IconButton onClick={() => { setEditingTopic(topic); setTopicTitle(topic.title); setTopicDesc(topic.description); setOpenTopicModal(true); }}>
                                    <Edit />
                                </IconButton>
                                <IconButton onClick={() => handleDeleteTopic(topic.id)}>
                                    <Delete />
                                </IconButton>
                                <Button startIcon={<Upload />} onClick={() => { setSelectedTopic(topic); setUploadOpen(true); }}>
                                    Загрузить документ
                                </Button>
                                <Button startIcon={<Language />} onClick={() => { setSelectedTopic(topic); setUrlOpen(true); setUrlError(null); }}>
                                    Добавить из URL
                                </Button>
                            </Box>
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    Документы ({documents[topic.id]?.length || 0})
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List>
                                        {documents[topic.id]?.map(doc => (
                                            <ListItem
                                                key={doc.id}
                                                secondaryAction={
                                                    <IconButton edge="end" onClick={() => handleDeleteDoc(doc.id, topic.id)}>
                                                        <Delete />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemText primary={doc.title} secondary={doc.description} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Modal open={openTopicModal} onClose={() => setOpenTopicModal(false)}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', p: 4, borderRadius: 2 }}>
                    <Typography variant="h6">{editingTopic ? 'Редактировать тему' : 'Новая тема'}</Typography>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Заголовок"
                        value={topicTitle}
                        onChange={e => setTopicTitle(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Описание"
                        value={topicDesc}
                        onChange={e => setTopicDesc(e.target.value)}
                    />
                    <Button variant="contained" onClick={handleSaveTopic} sx={{ mt: 2 }}>
                        Сохранить
                    </Button>
                </Box>
            </Modal>

            <Modal open={uploadOpen} onClose={() => setUploadOpen(false)}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', p: 4, borderRadius: 2 }}>
                    <Typography variant="h6">Загрузить документ</Typography>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Название"
                        value={docTitle}
                        onChange={e => setDocTitle(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Описание"
                        value={docDesc}
                        onChange={e => setDocDesc(e.target.value)}
                    />
                    <Button variant="contained" component="label" sx={{ mt: 1 }}>
                        Выбрать PDF
                        <input
                            type="file"
                            accept="application/pdf"
                            hidden
                            onChange={e => setDocFile(e.target.files?.[0] || null)}
                        />
                    </Button>
                    {docFile && (
                        <Typography variant="caption" sx={{ display: 'block' }}>
                            {docFile.name}
                        </Typography>
                    )}
                    <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={!docFile || !docTitle}
                        sx={{ mt: 2 }}
                    >
                        Загрузить
                    </Button>
                </Box>
            </Modal>
            <Modal open={urlOpen} onClose={() => !urlLoading && setUrlOpen(false)}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 450, bgcolor: 'background.paper', p: 4, borderRadius: 2 }}>
                    <Typography variant="h6">Добавить документ из URL</Typography>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="URL страницы"
                        placeholder="https://example.com/article"
                        value={urlValue}
                        onChange={e => setUrlValue(e.target.value)}
                        disabled={urlLoading}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Название (необязательно — определится автоматически)"
                        value={urlTitle}
                        onChange={e => setUrlTitle(e.target.value)}
                        disabled={urlLoading}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Описание (необязательно)"
                        value={urlDesc}
                        onChange={e => setUrlDesc(e.target.value)}
                        disabled={urlLoading}
                    />
                    {urlError && <Alert severity="error" sx={{ mt: 1 }}>{urlError}</Alert>}
                    <Button
                        variant="contained"
                        onClick={handleUrlImport}
                        disabled={!urlValue || urlLoading}
                        startIcon={urlLoading ? <CircularProgress size={16} /> : <Language />}
                        sx={{ mt: 2 }}
                    >
                        {urlLoading ? 'Загружаю...' : 'Загрузить'}
                    </Button>
                </Box>
            </Modal>
        </Box>
    );
};