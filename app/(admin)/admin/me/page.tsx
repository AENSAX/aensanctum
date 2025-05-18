'use client';

import { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    TextField,
    Button,
    IconButton,
    Alert,
} from '@mui/material';
import { useUser } from '@/lib/fetcher/fetchers';
import Link from 'next/link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import useSWR, { mutate } from 'swr';
import { fetcher } from '@/lib/fetcher/fetchers';

export default function AdminMePage() {
    const { user: currentUser, userLoading, userErrors } = useUser();
    const {
        data: keyData,
        error: keyErrors,
        isLoading: keyLoading,
    } = useSWR<{ accessKey: string | null }>('/api/admin/key', fetcher);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (userLoading || keyLoading) {
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

    if (userErrors && userErrors.length > 0) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                {userErrors.map((error: { field: string; message: string }) => (
                    <Typography key={error.field} color="error">
                        {error.message}
                    </Typography>
                ))}
            </Box>
        );
    }

    if (!currentUser) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography align="center">请先登录</Typography>
                <Link href="/login">
                    <Typography
                        sx={{ mt: 2, color: 'primary.main' }}
                        variant="h6"
                    >
                        登录
                    </Typography>
                </Link>
            </Box>
        );
    }

    if (!currentUser.isAdmin) {
        return <Typography color="error">你不是管理员</Typography>;
    }

    const generateAccessKey = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/admin/key', {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('生成密钥失败');
            }
            mutate('/api/admin/key');
        } catch (err) {
            setError(err instanceof Error ? err.message : '生成密钥失败');
        } finally {
            setLoading(false);
        }
    };

    const deleteAccessKey = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/admin/key', {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('删除密钥失败');
            }
            mutate('/api/admin/key');
        } catch (err) {
            setError(err instanceof Error ? err.message : '删除密钥失败');
        } finally {
            setLoading(false);
        }
    };

    const copyAccessKey = () => {
        if (keyData?.accessKey) {
            navigator.clipboard.writeText(keyData.accessKey);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    管理员信息
                </Typography>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="body1">
                        用户名：{currentUser.name}
                    </Typography>
                    <Typography variant="body1">
                        邮箱：{currentUser.email}
                    </Typography>
                </Box>

                <Typography variant="h6" gutterBottom>
                    API 访问密钥
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                >
                    使用 API
                    访问密钥，您可以通过程序接口管理系统。请妥善保管您的密钥。
                </Typography>

                {keyData?.accessKey ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                            fullWidth
                            value={keyData.accessKey}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                        <IconButton onClick={copyAccessKey}>
                            <ContentCopyIcon />
                        </IconButton>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={deleteAccessKey}
                            disabled={loading}
                        >
                            删除密钥
                        </Button>
                    </Box>
                ) : (
                    <Button
                        variant="contained"
                        onClick={generateAccessKey}
                        disabled={loading}
                    >
                        生成新的访问密钥
                    </Button>
                )}

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                {keyErrors && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        获取密钥信息失败
                    </Alert>
                )}
            </Paper>
        </Box>
    );
}
