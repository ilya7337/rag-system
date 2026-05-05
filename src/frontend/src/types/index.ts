export interface User {
    id: string;
    login: string;
    is_admin: boolean;
}

export interface Topic {
    id: string;
    title: string;
    description: string;
    created_at: string;
}

export interface Document {
    id: string;
    topic_id: string;
    title: string;
    description?: string;
    created_at: string;
    pdf_text?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    liked?: boolean;
    created_at: string;
}

export interface ChatSession {
    id: string;
    created_at: string;
    first_message: string;
}

export interface SendMessageResponse {
    answer: string;
    message_id: string;
    documents_found: number;
}

export interface Feedback {
    id: string;
    text: string;
    created_at: string;
}

export interface LogEntry {
    id: string;
    session_id: string;
    query: string;
    response: string;
    is_anonymous: boolean;
    created_at: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}