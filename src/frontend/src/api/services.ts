import apiClient from './client';
import type {
    User, Topic, Document, ChatSession, ChatMessage, Feedback, LogEntry, AuthResponse,
    SendMessageResponse
} from '../types';

export const auth = {
    login: (login: string, password: string) =>
        apiClient.post<AuthResponse>('/auth/login', { login, password }),
    register: (login: string, password: string) =>
        apiClient.post<User>('/auth/register', { login, password }),
    getMe: () => apiClient.get<User>('/auth/me'),
    logout: () => apiClient.post('/auth/logout'),
};

export const topics = {
    list: () => apiClient.get<{ items: Topic[] }>('/topics'),
    get: (id: string) => apiClient.get<Topic>(`/topics/${id}`),
    create: (data: { title: string; description: string }) =>
        apiClient.post<Topic>('/topics', data),
    update: (id: string, data: { title: string; description: string }) =>
        apiClient.put<Topic>(`/topics/${id}`, data),
    delete: (id: string) => apiClient.delete(`/topics/${id}`),
};

export const documents = {
    listByTopic: (topicId: string) =>
        apiClient.get<Document[]>(`/documents/topic/${topicId}`),
    get: (docId: string) => apiClient.get<Document>(`/documents/${docId}`),
    upload: (topicId: string, formData: FormData) =>
        apiClient.post<Document>(`/documents/upload/${topicId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    delete: (docId: string) => apiClient.delete(`/documents/${docId}`),
    createFromText: (data: { topic_id: string; title: string; description?: string; pdf_text: string }) =>
        apiClient.post<Document>('/documents', data),
};

export const chat = {
    send: (text: string) => apiClient.post<SendMessageResponse>('/chat/send', { text }),
    history: () => apiClient.get<ChatSession[]>('/chat/history'),
    sessionMessages: (sessionId: string) =>
        apiClient.get<ChatMessage[]>(`/chat/history/${sessionId}`),
    rate: (messageId: string, liked: boolean) =>
        apiClient.post(`/chat/${messageId}/rate`, { liked }),
    new: () => apiClient.post('/chat/new'),
};

export const feedback = {
    create: (text: string) => apiClient.post<Feedback>('/feedback', { text }),
};

export const admin = {
    logs: () => apiClient.get<{ items: LogEntry[] }>('/admin/logs'),
};