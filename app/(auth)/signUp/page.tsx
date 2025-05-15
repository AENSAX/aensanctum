'use client';

import { SignUpForm } from '@/app/_components/auth';
import { Container, Paper, Typography, Box, Link } from '@mui/material';
import NextLink from 'next/link';

export default function SignUpPage() {
    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    mt: 8,
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
                    }}
                >
                    <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                        创建新账户
                    </Typography>
                    <SignUpForm />
                    <Typography>
                        或{' '}
                        <Link
                            href="/login"
                            component={NextLink}
                            color="secondary"
                        >
                            登录
                        </Link>
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
}
