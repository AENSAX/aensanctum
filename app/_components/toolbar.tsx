'use client';

import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    Box,
} from '@mui/material';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Toolbar, IconButton, Tabs, Tab } from '@mui/material';
import React from 'react';

// 侧边栏宽度
const drawerWidth = 64;

// 定义按钮项接口
interface LeftBarItem {
    icon: React.ReactElement;
    onClick?: () => void;
    href?: string;
}

interface LeftBarProps {
    isOpen: boolean;
    items: LeftBarItem[];
}

export function LeftBar({ isOpen, items }: LeftBarProps) {
    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
            variant="persistent"
            anchor="left"
            open={isOpen}
        >
            <Box sx={{ overflow: 'auto', mt: 8 }}>
                <List>
                    {items.map((item, index) => (
                        <ListItem key={index} disablePadding>
                            <ListItemButton
                                component={item.href ? Link : 'div'}
                                href={item.href}
                                onClick={item.onClick}
                                sx={{
                                    justifyContent: 'center',
                                    px: 2.5,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 'auto',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
}

//顶部导航栏标签
interface TopBarTab {
    label: string;
    value: string;
    icon: React.ReactElement;
}
// 顶部导航栏组件的属性接口
interface TopBarProps {
    tabs: TopBarTab[];
    onLeftMenuItemClick: () => void;
}

export function TopBar({
    tabs,
    onLeftMenuItemClick: onMenuClick,
}: TopBarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        router.push(newValue);
    };

    const getTabValue = () => {
        return (
            tabs.find((t) => pathname.startsWith(t.value))?.value ||
            tabs[0].value
        );
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                boxShadow: 'none',
            }}
        >
            <Toolbar>
                {/* 左侧菜单按钮 */}
                <IconButton
                    aria-label="open drawer"
                    onClick={onMenuClick}
                    edge="start"
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>

                {/* Logo 区域 */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Link href="/index/albums" passHref>
                        <Image
                            src="/logo.png"
                            alt="AenSanctum Logo"
                            width={60}
                            height={30}
                            style={{ objectFit: 'contain', cursor: 'pointer' }}
                        />
                    </Link>
                </Box>

                {/* 导航标签页 */}
                <Box sx={{ ml: 4 }}>
                    <Tabs
                        value={getTabValue()}
                        onChange={handleTabChange}
                        sx={{
                            minHeight: 'auto',
                            '& .MuiTab-root': {
                                minHeight: 'auto',
                                padding: '8px 16px',
                                transition: (theme) =>
                                    theme.transitions.create(
                                        'background-color',
                                    ),
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.4)', // 选中状态背景
                                    color: 'text.primary',
                                },
                                ':hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                },
                            },
                            '& .MuiTabs-indicator': {
                                display: 'none', // 隐藏底部指示器
                            },
                        }}
                    >
                        {/* 标签页 */}
                        {tabs.map((t, index) => (
                            <Tab
                                key={index}
                                value={t.value}
                                label={t.label}
                                icon={t.icon || <HomeIcon />}
                                iconPosition="start"
                                sx={{
                                    color: 'text.primary',
                                    mx: 1,
                                    borderRadius: '4px',
                                }}
                            />
                        ))}
                    </Tabs>
                </Box>

                {/* 右侧弹性空间 */}
                <Box sx={{ flexGrow: 1 }} />

                {/* 个人中心按钮 */}
                <IconButton
                    component={Link}
                    href="/me"
                    sx={{
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)', // 悬停效果
                        },
                    }}
                >
                    <PersonIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}
