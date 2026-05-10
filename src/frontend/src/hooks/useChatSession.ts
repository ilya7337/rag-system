import { useState, useCallback } from 'react';
import * as api from '../api/services';
import type { ChatMessage } from '../types';

export const useChatSession = (isAuthenticated: boolean, onHistoryUpdate: () => void) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    const loadSession = useCallback(async (sessionId: string) => {
        if (!isAuthenticated) return;
        try {
            const res = await api.chat.sessionMessages(sessionId);
            setMessages(res.data);
            setCurrentSessionId(sessionId);
        } catch (error) {
            console.error(error);
        }
    }, [isAuthenticated]);

    const sendMessage = useCallback(async (text: string) => {
        if (!isAuthenticated || !text.trim()) return;
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);
        try {
            const response = await api.chat.send(text);
            const assistantMsg: ChatMessage = {
                id: Date.now().toString() + '_assistant',
                role: 'assistant',
                content: response.data.answer,
                sources: response.data.sources,
                created_at: new Date().toISOString(),
            };
            setMessages(prev => [...prev, assistantMsg]);
            await onHistoryUpdate();
        } catch (error: any) {
            setMessages(prev => [...prev, {
                id: 'err',
                role: 'assistant',
                content: `Ошибка: ${error.response?.data?.detail || error.message}`,
                created_at: new Date().toISOString(),
            }]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, onHistoryUpdate]);

    const rateMessage = useCallback(async (messageId: string, liked: boolean) => {
        if (!isAuthenticated) return;
        try {
            await api.chat.rate(messageId, liked);
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, liked } : m));
        } catch (error) {
            console.error(error);
        }
    }, [isAuthenticated]);

    const newChat = useCallback(async () => {
        if (!isAuthenticated) return null;
        try {
            const response = await api.chat.new();
            const newSessionId = response.data.session_id;
            setCurrentSessionId(newSessionId);
            setMessages([]);
            await onHistoryUpdate();
            return newSessionId;
        } catch (error) {
            console.error('Ошибка создания чата', error);
            return null;
        }
    }, [isAuthenticated, onHistoryUpdate]);

    return { messages, loading, currentSessionId, sendMessage, loadSession, rateMessage, newChat, setMessages };
};