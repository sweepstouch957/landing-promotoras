'use client';

import * as React from 'react';
import {
    Box, Paper, TextField, Button,
    Typography, Alert, CircularProgress
} from '@mui/material';

export default function GmailTestPage() {
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [result, setResult] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const onSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setResult(null);

        if (!email) {
            setResult({ type: 'error', text: 'Ingresa un correo.' });
            return;
        }

        setLoading(true);
        try {
            const resp = await fetch('/api/send-cashier-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await resp.json().catch(() => ({}));

            if (resp.ok) {
                setResult({ type: 'success', text: '¡Sí funciona! Revisa tu correo.' });
            } else {
                setResult({ type: 'error', text: `Error: ${data?.message || 'No se pudo enviar.'}` });
            }
        } catch (err: any) {
            setResult({ type: 'error', text: err?.message || 'Error al enviar.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Paper elevation={3} sx={{ p: 3, width: '100%', maxWidth: 480 }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                    Test de Envío con Gmail SMTP
                </Typography>

                <Box component="form" onSubmit={onSend}>
                    <TextField
                        label="Correo de prueba"
                        fullWidth
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <Button type="submit" variant="contained" fullWidth disabled={loading}>
                        {loading ? <CircularProgress size={22} /> : 'Enviar'}
                    </Button>
                </Box>

                {result && (
                    <Alert
                        severity={result.type}
                        sx={{ mt: 2 }}
                        onClose={() => setResult(null)}
                    >
                        {result.text}
                    </Alert>
                )}

                <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'text.secondary' }}>
                    Envía un correo usando Gmail SMTP a través de /api/send-gmail-test.
                </Typography>
            </Paper>
        </Box>
    );
}
