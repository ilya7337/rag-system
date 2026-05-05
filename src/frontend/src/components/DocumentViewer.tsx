import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, CircularProgress } from '@mui/material';
import * as api from '../api/services';
import {type Document } from '../types';

interface DocumentViewerProps {
    docId: string | null;
    open: boolean;
    onClose: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ docId, open, onClose }) => {
    const [document, setDocument] = useState<Document | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (docId && open) {
            setLoading(true);
            api.documents.get(docId)
                .then(res => setDocument(res.data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [docId, open]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{document?.title || 'Документ'}</DialogTitle>
            <DialogContent dividers>
                {loading ? <CircularProgress /> : (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {document?.pdf_text || 'Нет содержимого'}
                    </Typography>
                )}
            </DialogContent>
        </Dialog>
    );
};