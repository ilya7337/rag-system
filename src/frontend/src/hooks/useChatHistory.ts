import { useState, useCallback, useMemo } from 'react';
import * as api from '../api/services';
import type { ChatSession } from '../types';
import { groupSessionsByDate } from '../utils/chatUtils';

export const useChatHistory = (isAuthenticated: boolean) => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);

    const loadHistory = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const res = await api.chat.history();
            setSessions(res.data);
        } catch (error) {
            console.error(error);
        }
    }, [isAuthenticated]);

    const groupedSessions = useMemo(() => groupSessionsByDate(sessions), [sessions]);

    return { sessions, loadHistory, groupedSessions };
};