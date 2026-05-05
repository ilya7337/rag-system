import React, { useState, useEffect, useRef } from 'react';
import { Box, Drawer, IconButton, Alert, Divider, Button } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChatHistory } from '../../hooks/useChatHistory';
import { useChatSession } from '../../hooks/useChatSession';
import { ChatHeader } from './ChatHeader';
import { ChatSidebar } from './ChatSidebar';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';

export const ChatPanel: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { sessions, loadHistory, groupedSessions } = useChatHistory(isAuthenticated);
    const { messages, loading, currentSessionId, sendMessage, loadSession, rateMessage, newChat } = useChatSession(isAuthenticated, loadHistory);

    useEffect(() => {
        if (isAuthenticated && open) {
            loadHistory();
        }
    }, [isAuthenticated, open, loadHistory]);

    useEffect(() => {
        if (open && !currentSessionId && sessions.length > 0) {
            const last = sessions.reduce((latest, s) => new Date(s.created_at) > new Date(latest.created_at) ? s : latest);
            loadSession(last.id);
        }
    }, [open, sessions, currentSessionId, loadSession]);

    const handleNewChat = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            setOpen(false);
        } else {
            await newChat();
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <>
            <IconButton
                onClick={() => setOpen(true)}
                sx={{ position: 'fixed', bottom: 80, right: 24, zIndex: 1000, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
            >
                <ChatIcon />
            </IconButton>
            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: showHistory ? 680 : 480 } } }}
            >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <ChatHeader
                        onClose={() => setOpen(false)}
                        onToggleHistory={() => setShowHistory(!showHistory)}
                        onNewChat={handleNewChat}
                        showHistory={showHistory}
                        isAuthenticated={isAuthenticated}
                    />
                    {!isAuthenticated && (
                        <Alert severity="info" sx={{ m: 2 }}>
                            Чтобы пользоваться чатом, <strong>войдите в систему</strong> или <strong>зарегистрируйтесь</strong>.
                            <Button size="small" onClick={() => navigate('/login')} sx={{ ml: 1 }}>Войти</Button>
                        </Alert>
                    )}
                    <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        {showHistory && isAuthenticated && (
                            <ChatSidebar
                                sessions={groupedSessions}
                                currentSessionId={currentSessionId}
                                onSelectSession={loadSession}
                            />
                        )}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <ChatMessageList
                                messages={messages}
                                loading={loading}
                                isAuthenticated={isAuthenticated}
                                onRate={rateMessage}
                                messagesEndRef={messagesEndRef}
                            />
                            <Divider />
                            <ChatInput onSend={sendMessage} loading={loading} disabled={!isAuthenticated} />
                        </Box>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
};