'use client';

import Link from 'next/link';
import { LoginForm } from '@/app/_components/auth';
import { Container, Paper, Typography, Box } from '@mui/material';

export default function LoginPage() {
  return (
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
            登录到您的账户
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            或{' '}
            <Link href="/register" style={{ color: '#1976d2', textDecoration: 'none' }}>
              创建新账户
            </Link>
          </Typography>
          <LoginForm />
        </Paper>
      </Box>
    </Container>
  );
} 