import {
    Typography,
    Box,
    Card,
    CardContent,
    Avatar,
    Button,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/app/_components/dialog';
import { User } from '@/lib/types';

export function UserInfoCard({ userInfo }: { userInfo: User }) {
    const router = useRouter();
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', {
            method: 'POST',
        });
        router.push('/login');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
            }}
        >
            <Card
                sx={{
                    width: '60%',
                    mt: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'black',
                    position: 'relative',
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar
                            sx={{
                                width: 64,
                                height: 64,
                                fontSize: '1.5rem',
                            }}
                        >
                            {userInfo?.name?.[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <Box sx={{ ml: 2 }}>
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
                        </Box>
                    </Box>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutIcon />}
                        onClick={() => setLogoutDialogOpen(true)}
                        sx={{
                            position: 'absolute',
                            right: 16,
                            bottom: 16,
                        }}
                    >
                        登出
                    </Button>
                </CardContent>
            </Card>

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
