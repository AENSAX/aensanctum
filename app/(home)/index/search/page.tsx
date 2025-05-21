'use client';

import { useState } from 'react';
import {
    Divider,
    Box,
    Container,
    IconButton,
    Paper,
    Alert,
    Typography,
} from '@mui/material';
import { Search as SearchIcon, Clear } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SearchBox() {
    const router = useRouter();
    const [keyword, setKeyword] = useState('');
    const [errors, setErrors] = useState<{ field: string; message: string }[]>(
        [],
    );

    const handleSearch = async () => {
        if (!keyword.trim()) {
            setErrors([{ field: 'key', message: '输入关键字然后搜索' }]);
            return;
        }
        if (keyword.trim().length > 100) {
            setErrors([{ field: 'key', message: '关键字不得大于100个字符' }]);
            return;
        }
        if (!/^[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/.test(keyword.trim())) {
            setErrors([
                {
                    field: 'key',
                    message: '关键字只能包含中英文、数字、空格和横杠',
                },
            ]);
            return;
        }
        router.push(`/result?q=${keyword}`);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setErrors([]);
        setKeyword(event.target.value);
    };

    const handleClear = () => {
        setErrors([]);
        setKeyword('');
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSearch();
        }
    };

    return (
        <Container maxWidth="xl">
            <Box
                sx={{
                    mt: 15,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Image src="/logo.png" alt="logo" width={150} height={150} />
                <Paper
                    elevation={1}
                    sx={{
                        p: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: 940,
                        borderRadius: 3,
                        border: '1px solid #dfe1e5',
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: '0 1px 6px rgb(32 33 36 / 28%)',
                            borderColor: 'rgba(223,225,229,0)',
                        },
                    }}
                >
                    <IconButton sx={{ p: '10px' }} aria-label="search">
                        <SearchIcon sx={{ color: '#9aa0a6' }} />
                    </IconButton>
                    <input
                        value={keyword}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="搜索图集..."
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: '16px',
                            padding: '8px',
                            backgroundColor: 'transparent',
                        }}
                    />
                    {keyword && (
                        <IconButton sx={{ p: '10px' }} onClick={handleClear}>
                            <Clear />
                        </IconButton>
                    )}
                    <Divider
                        sx={{ height: 28, m: 0.5 }}
                        orientation="vertical"
                    />
                    <IconButton
                        color="primary"
                        sx={{ p: '10px' }}
                        onClick={handleSearch}
                    >
                        <SearchIcon />
                    </IconButton>
                </Paper>
                <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mt: 5 }}
                >
                    欢迎回来👏，现在你可以在这里搜索任何图集！
                </Typography>
                {errors &&
                    errors.map((error) => (
                        <Alert
                            key={error.field}
                            severity="error"
                            sx={{ mt: 2 }}
                        >
                            {error.message}
                        </Alert>
                    ))}
            </Box>
        </Container>
    );
}
