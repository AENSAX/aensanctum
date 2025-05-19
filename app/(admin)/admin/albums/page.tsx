'use client';

import { useState } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
    IconButton,
    Pagination,
} from '@mui/material';
import { useUser } from '@/lib/fetcher/fetchers';
import Link from 'next/link';
import useSWRInfinite from 'swr/infinite';
import { fetcher } from '@/lib/fetcher/fetchers';
import DeleteIcon from '@mui/icons-material/Delete';
import { ConfirmDialog } from '@/app/_components/dialog';

interface AdminAlbum {
    id: number;
    name: string;
    createdAt: string;
    ownerId: number;
}

export default function AlbumsAdminPage() {
    const { user: currentUser, userLoading, userErrors } = useUser();
    const [currentPage, setCurrentPage] = useState(1);

    const getKey = (index: number, previousPageData: AdminAlbum[]) => {
        if (previousPageData && previousPageData.length === 0) {
            return null;
        }
        return `/api/admin/albums?page=${index + 1}`;
    };

    const {
        data: paginatedAlbums,
        error: albumsErrors,
        isLoading: albumsLoading,
        setSize,
    } = useSWRInfinite<AdminAlbum[]>(getKey, fetcher);

    const [albumToDelete, setAlbumToDelete] = useState<AdminAlbum | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number,
    ) => {
        setCurrentPage(value);
        setSize(value);
    };

    if (userLoading || albumsLoading) {
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

    if (albumsErrors) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography color="error">获取图集列表失败</Typography>
            </Box>
        );
    }

    const currentAlbums = paginatedAlbums?.[currentPage - 1] || [];
    const totalPages =
        currentAlbums.length < 10 ? currentPage : currentPage + 1;

    if (!currentAlbums || currentAlbums.length === 0) {
        return <Typography align="center">暂无图集</Typography>;
    }

    const handleDeleteAlbum = async (albumId: number) => {
        const response = await fetch(`/api/admin/albums/${albumId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const result = await response.json();
            throw result;
        }
        alert('图集删除成功');
        setSize(currentPage);
        setDeleteDialogOpen(false);
        setAlbumToDelete(null);
    };

    return (
        <Box sx={{ p: 3 }}>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>名称</TableCell>
                            <TableCell>创建时间</TableCell>
                            <TableCell>创建者UID</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currentAlbums.map((album) => (
                            <TableRow key={album.id}>
                                <TableCell>{album.id}</TableCell>
                                <TableCell>
                                    <Link href={`/albums/${album.id}`}>
                                        {album.name}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {new Date(album.createdAt).toLocaleString(
                                        'zh-CN',
                                    )}
                                </TableCell>
                                <TableCell>{album.ownerId}</TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => {
                                            setAlbumToDelete(album);
                                            setDeleteDialogOpen(true);
                                        }}
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box
                sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}
            >
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                />
            </Box>

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setAlbumToDelete(null);
                }}
                title="删除图集"
                content="确定要删除该图集吗？此操作不可恢复。"
                primaryButton={{
                    text: '确定',
                    onClick: () =>
                        albumToDelete && handleDeleteAlbum(albumToDelete.id),
                }}
                secondaryButton={{
                    text: '取消',
                    onClick: () => {
                        setDeleteDialogOpen(false);
                        setAlbumToDelete(null);
                    },
                }}
            />
        </Box>
    );
}
