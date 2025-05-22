'use client';

import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/fetchers';
import { TopBar } from '@/app/_components/toolbar';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CollectionsIcon from '@mui/icons-material/Collections';

const topBarTabs = [
    {
        label: '用户管理',
        value: '/admin/users',
        icon: <AdminPanelSettingsIcon />,
    },
    {
        label: '图集管理',
        value: '/admin/albums',
        icon: <CollectionsIcon />,
    },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user: currentUser, userLoading } = useUser();

    useEffect(() => {
        if (!userLoading && (!currentUser || !currentUser.isAdmin)) {
            router.push('/');
        }
    }, [currentUser, userLoading, router]);

    if (userLoading) {
        return null;
    }

    if (!currentUser?.isAdmin) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex' }}>
            {/* 顶部导航栏 */}
            <TopBar tabs={topBarTabs} onLeftMenuItemClick={() => {}} />

            {/* 主内容区域 */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    mt: 8,
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
