'use client';

import Link from 'next/link';
import RegisterForm from './components/RegisterForm';
import { Container, Paper, Typography, Box } from '@mui/material';

export default function RegisterPage() {
    return (
        <>
            <Container component="main" maxWidth="xs">
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            padding: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                            创建新账户
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            或{' '}
                            <Link href="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
                                登录已有账户
                            </Link>
                        </Typography>
                        <RegisterForm />
                    </Paper>
                </Box>
            </Container>
        </>
    )
}
