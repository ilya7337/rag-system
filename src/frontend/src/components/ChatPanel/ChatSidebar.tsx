import React, { useState, useMemo } from 'react';
import { Box, TextField, InputAdornment, Typography, Divider, List, ListItemButton, ListItemIcon, Avatar, Tooltip, IconButton } from '@mui/material';
import { Search, ChatBubbleOutlined, Today, DeleteOutlined } from '@mui/icons-material';
import { formatChatTitle } from '../../utils/chatUtils';
import type { ChatSession } from '../../types';

interface ChatSidebarProps {
    sessions: Record<string, ChatSession[]>;
    currentSessionId: string | null;
    onSelectSession: (id: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ sessions, currentSessionId, onSelectSession }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) return sessions;
        const lowerQuery = searchQuery.toLowerCase();
        const filtered: typeof sessions = {};
        Object.entries(sessions).forEach(([group, groupSessions]) => {
            const matched = groupSessions.filter(s =>
                formatChatTitle(s.first_message || null).toLowerCase().includes(lowerQuery)
            );
            if (matched.length) filtered[group] = matched;
        });
        return filtered;
    }, [sessions, searchQuery]);

    return (
        <Box sx={{ width: 260, borderRight: 1, borderColor: 'divider', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: 2, pb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>История диалогов</Typography>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Поиск по чатам..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
                />
            </Box>
            <Divider />
            <Box sx={{ flex: 1, overflowY: 'auto', px: 1, py: 1 }}>
                {Object.keys(filteredGroups).length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                        <ChatBubbleOutlined sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
                        <Typography variant="body2">{searchQuery ? 'Ничего не найдено' : 'Нет сохранённых чатов'}</Typography>
                    </Box>
                ) : (
                    Object.entries(filteredGroups).map(([group, groupSessions]) => (
                        <Box key={group} sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ px: 1, py: 0.5, display: 'block', color: 'text.secondary', fontWeight: 500 }}>{group}</Typography>
                            <List disablePadding>
                                {groupSessions.map((session) => (
                                    <ListItemButton
                                        key={session.id}
                                        onClick={() => onSelectSession(session.id)}
                                        selected={currentSessionId === session.id}
                                        sx={{ borderRadius: 2, mb: 0.5 }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: currentSessionId === session.id ? 'primary.main' : 'grey.400' }}>
                                                <ChatBubbleOutlined fontSize="small" />
                                            </Avatar>
                                        </ListItemIcon>
                                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                            <Typography variant="body2" sx={{ fontWeight: currentSessionId === session.id ? 600 : 400 }} noWrap>
                                                {formatChatTitle(session.first_message || null)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                <Today sx={{ fontSize: 12 }} />
                                                {new Date(session.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                            </Typography>
                                        </Box>
                                        <Tooltip title="Удалить диалог (в разработке)">
                                            <IconButton
                                                edge="end"
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    alert('Функция удаления будет добавлена позже');
                                                }}
                                            >
                                                <DeleteOutlined fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemButton>
                                ))}
                            </List>
                        </Box>
                    ))
                )}
            </Box>
        </Box>
    );
};