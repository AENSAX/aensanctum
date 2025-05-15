import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, Button, Alert, Box } from '@mui/material';
import React from 'react';

export function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ field: string; message: string }[]>(
        [],
    );
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);
        setIsLoading(true);
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        if (response.status !== 200) {
            const data = await response.json();
            setErrors(data.errors);
            setIsLoading(false);
            return;
        }
        setIsLoading(false);
        router.push('/index');
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="邮箱地址"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="密码"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {errors &&
                errors.map((error) => (
                    <Alert key={error.field} severity="error" sx={{ mt: 2 }}>
                        {error.message}
                    </Alert>
                ))}

            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
            >
                登录
            </Button>
        </Box>
    );
}

export function SignUpForm() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ field: string; message: string }[]>(
        [],
    );
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (
        e: React.FormEvent,
        name: string,
        email: string,
        password: string,
    ) => {
        e.preventDefault();
        setErrors([]);
        setIsLoading(true);
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        if (response.status !== 200) {
            setErrors(data.errors);
            setIsLoading(false);
            return;
        }
        setIsLoading(false);
        router.push('/login');
    };

    return (
        <Box
            component="form"
            onSubmit={(e) => {
                handleSubmit(e, name, email, password);
            }}
            sx={{ width: '100%' }}
        >
            <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="用户名"
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="邮箱地址"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="密码"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {errors &&
                errors.map((error) => (
                    <Alert key={error.field} severity="error" sx={{ mt: 2 }}>
                        {error.message}
                    </Alert>
                ))}

            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
            >
                注册
            </Button>
        </Box>
    );
}
