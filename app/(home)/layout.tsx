'use client';

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { useState } from 'react';
import { FormDialog } from '@/app/_components/dialog';
import HomeIcon from '@mui/icons-material/Home';
import CollectionsIcon from '@mui/icons-material/Collections';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { TopBar } from '@/app/_components/toolbar';
import { LeftBar } from '@/app/_components/toolbar';
import { tagsFormater } from '@/lib/fetcher/fetchers';
import LabelIcon from '@mui/icons-material/Label';
import { mutate } from 'swr';
import React from 'react';

const drawerWidth = 64;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
    open?: boolean;
}>(({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    marginLeft: `-${drawerWidth}px`,
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: 0,
    }),
}));

const topBarTabs = [
    {
        label: '图集',
        value: '/index/albums',
        icon: <CollectionsIcon />,
    },
    {
        label: '标签',
        value: '/index/tags',
        icon: <LabelIcon />,
    },
];

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [leftBarOpen, setLeftBarOpen] = useState(false);
    const [createAlbumDialogOpen, setCreateAlbumDialogOpen] = useState(false);

    const leftBarItems = [
        {
            icon: <HomeIcon />,
            href: '/index/albums',
        },
        {
            icon: <CreateNewFolderIcon />,
            onClick: () => setCreateAlbumDialogOpen(true),
        },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <TopBar
                tabs={topBarTabs}
                onLeftMenuItemClick={() => setLeftBarOpen(!leftBarOpen)}
            />

            <LeftBar isOpen={leftBarOpen} items={leftBarItems} />

            <Main open={leftBarOpen}>
                <Box sx={{ mt: 8 }}>{children}</Box>
            </Main>

            <FormDialog
                title="创建图集"
                onClose={() => setCreateAlbumDialogOpen(false)}
                isOpen={createAlbumDialogOpen}
                fields={{
                    name: {
                        label: '图集名称',
                        type: 'text',
                        required: true,
                        placeholder: '请输入图集名称',
                        validator: (val) => {
                            if (val === undefined) return '值无效';
                            if (
                                !/^[a-zA-Z0-9\u4e00-\u9fa5\- ]{1,100}$/.test(
                                    val.trim(),
                                )
                            ) {
                                return '图集名称只能包含中英文、数字、空格和横杠，长度在1-100个字符之间';
                            }
                            return null;
                        },
                    },
                    tags: {
                        label: '图集标签',
                        type: 'text',
                        required: true,
                        placeholder:
                            '请输入图集标签，用空格分隔（1-10个标签，每个标签1-20字符）',
                        validator: (val) => {
                            if (val === undefined) return '值无效';
                            if (
                                !/^[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/.test(
                                    val.trim(),
                                )
                            ) {
                                return '标签只能包含中英文、数字、空格和横杠';
                            }
                            return null;
                        },
                    },
                }}
                onSubmit={async (data) => {
                    const response = await fetch('/api/albums', {
                        method: 'POST',
                        body: JSON.stringify({
                            name: data.name?.trim(),
                            tags: tagsFormater(data['tags'] ?? ''),
                            isPrivate: true,
                        }),
                    });
                    if (!response.ok) {
                        const result = await response.json();
                        throw result;
                    } else {
                        setCreateAlbumDialogOpen(false);
                    }
                }}
                onComplete={() => {
                    mutate('/api/albums');
                    mutate('/api/my/albums');
                }}
            />
        </Box>
    );
}
