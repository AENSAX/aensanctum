import {
    Typography,
    Box,
    Paper,
    Avatar,
    Button,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/app/_components/dialog';
import { User } from '@/lib/types';

export function UserInfoCard({
    userInfo,
    albumsCount,
}: {
    userInfo: User;
    albumsCount: number;
}) {
    const router = useRouter();
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', {
            method: 'POST',
        });
        router.push('/login');
    };

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box sx={{ p: 2, mx: 'auto' }}>
            <Paper sx={{ p: 3 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'center' : 'flex-start',
                        gap: 2,
                        mb: 3,
                    }}
                >
                    <Avatar
                        sx={{
                            width: 64,
                            height: 64,
                            fontSize: '1.5rem',
                        }}
                    >
                        {userInfo?.name?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <Box
                        sx={{
                            textAlign: isMobile ? 'center' : 'left',
                        }}
                    >
                        <Typography variant="h6" component="div">
                            {userInfo?.name || '未登录'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            UID: {userInfo?.id || '---'}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                        >
                            Email: {userInfo?.email || '---'}
                        </Typography>
                        <Typography sx={{ mt: 2, fontWeight: 'medium' }}>
                            共计上传 {albumsCount} 个图集
                        </Typography>
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: isMobile ? 'center' : 'flex-end',
                        mt: 2,
                    }}
                >
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutIcon />}
                        onClick={() => setLogoutDialogOpen(true)}
                        sx={{ minWidth: 120 }}
                    >
                        登出
                    </Button>
                </Box>
            </Paper>

            <ConfirmDialog
                isOpen={logoutDialogOpen}
                onClose={() => setLogoutDialogOpen(false)}
                title="登出"
                content="确定要登出吗？"
                primaryButton={{ text: '确定', onClick: handleLogout }}
                secondaryButton={{
                    text: '取消',
                    onClick: () => setLogoutDialogOpen(false),
                }}
            />
        </Box>
    );
}
