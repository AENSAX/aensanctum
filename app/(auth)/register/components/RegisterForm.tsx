import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, Button, Alert, Box } from '@mui/material';

export default function RegisterForm() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = useCallback(async (name: string, email: string, password: string) => {
        setError('');

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    // 显示验证错误信息
                    setError(data.error.message || '输入数据验证失败');
                } else {
                    setError('注册失败，请稍后重试');
                }
                return;
            }

            router.push('/login');
        }
        catch (err) {
            setError('服务器错误，请稍后重试');
        }
    }, []);

    return (
        <Box component="form" onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(name, email, password);
        }} sx={{ width: '100%' }}>
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

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                注册
            </Button>
        </Box>
    );
}