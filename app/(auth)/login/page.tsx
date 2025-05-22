'use client';

import { LoginForm } from '@/app/_components/auth';
import {
    Container,
    Paper,
    Typography,
    Box,
    Link,
    CircularProgress,
} from '@mui/material';
import NextLink from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/fetchers';
import { useEffect } from 'react';

export default function LoginPage() {
    const { user, userLoading } = useUser();
    const router = useRouter();
    useEffect(() => {
        if (user && !userLoading) {
            router.push('/index/search');
        }
    }, [user, userLoading, router]);

    if (userLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }
    if (userLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }
    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ mt: 8 }}>
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Image
                        src="/logo.png"
                        alt="logo"
                        width={100}
                        height={100}
                    />
                    <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                        登录到您的账户
                    </Typography>
                    <LoginForm />
                    <Typography>
                        或{' '}
                        <Link
                            href="/signUp"
                            component={NextLink}
                            color="secondary"
                        >
                            注册
                        </Link>
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
}
