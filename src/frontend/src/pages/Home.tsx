import React, { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, CircularProgress, Alert, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { School, MenuBook, TrendingUp } from '@mui/icons-material';
import * as api from '../api/services';
import type { Topic } from '../types';

export const Home: React.FC = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.topics.list()
            .then(res => {
                const items = res.data?.items;
                if (Array.isArray(items)) setTopics(items);
                else setTopics([]);
            })
            .catch(err => {
                console.error(err);
                setError('Не удалось загрузить темы');
                setTopics([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
    if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    База знаний проектной деятельности
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
                    Изучайте методологии, технологии и лучшие практики. Задавайте вопросы AI-ассистенту на снове загруженных документов.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 4 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <School fontSize="large" color="primary" />
                        <Typography variant="body2">Студентам</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <MenuBook fontSize="large" color="primary" />
                        <Typography variant="body2">Преподавателям</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <TrendingUp fontSize="large" color="primary" />
                        <Typography variant="body2">Сотрудникам</Typography>
                    </Box>
                </Box>
            </Box>

            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                Доступные темы
            </Typography>

            {topics.length === 0 ? (
                <Alert severity="info">Пока нет ни одной темы. Зайдите позже или обратитесь к администратору.</Alert>
            ) : (
                <Grid container spacing={3}>
                    {topics.map(topic => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={topic.id}>
                            <Card
                                onClick={() => navigate(`/topic/${topic.id}`)}
                                sx={{
                                    cursor: 'pointer',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-6px)',
                                        boxShadow: (theme) => theme.shadows[8],
                                    },
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h5" component="div" gutterBottom>
                                        {topic.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {topic.description}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'primary.main' }}>
                                        Подробнее →
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};