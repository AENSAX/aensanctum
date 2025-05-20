'use client';
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Divider,
    Pagination,
} from '@mui/material';
import { PicturesGrid } from '@/app/_components/picture';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EditAlbumInfo, EditAlbumPictures } from '@/app/_components/album';
import { ConfirmDialog } from '@/app/_components/dialog';
import { AlbumDetailCard } from '@/app/_components/album';
import { useUser, useAlbum, useAlbumPictures } from '@/lib/fetcher/fetchers';
import { useParams } from 'next/navigation';

export default function AlbumPage() {
    const albumId = useParams().id as string;
    const { album, albumErrors, albumLoading } = useAlbum(albumId);
    const { user, userErrors, userLoading } = useUser();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editPicturesDialogOpen, setEditPicturesDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const { paginatedPictures, picturesErrors, picturesLoading } =
        useAlbumPictures(currentPage, albumId);

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number,
    ) => {
        setCurrentPage(value);
    };

    const router = useRouter();
    if (albumLoading || userLoading) {
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
    if (albumErrors && albumErrors.length > 0) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                {albumErrors.map(
                    (error: { field: string; message: string }) => (
                        <Typography key={error.field} color="error">
                            {error.message}
                        </Typography>
                    ),
                )}
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
    if (picturesErrors && picturesErrors.length > 0) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                {picturesErrors.map(
                    (error: { field: string; message: string }) => (
                        <Typography key={error.field} color="error">
                            {error.message}
                        </Typography>
                    ),
                )}
            </Box>
        );
    }
    if (!album) {
        return <Typography align="center">图集不存在</Typography>;
    }
    if (!user) {
        return <Typography align="center">请先登录</Typography>;
    }

    const canEdit = user.id === album.ownerId;

    if (album.isPrivate && !canEdit) {
        return <Typography align="center">你无权限访问这个图集</Typography>;
    }

    const handleDeleteAlbum = async () => {
        setIsDeleting(true);
        const response = await fetch(`/api/my/albums/${albumId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const result = await response.json();
            setIsDeleting(false);
            throw result;
        }

        router.push('/me');
        setIsDeleting(false);
        setDeleteDialogOpen(false);
    };

    const handleEditSuccess = () => {
        setEditDialogOpen(false);
    };

    const currentPictures = paginatedPictures || [];
    const totalPages = album._count.pictures
        ? Math.ceil(album._count.pictures / 10)
        : 0;

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <AlbumDetailCard
                    albumId={albumId}
                    onAddPictures={() => setEditPicturesDialogOpen(true)}
                    onEdit={() => setEditDialogOpen(true)}
                    onDelete={() => setDeleteDialogOpen(true)}
                />

                <Divider sx={{ my: 4 }} />

                <Box>
                    {picturesLoading ? (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                my: 4,
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : currentPictures.length === 0 ? (
                        <Typography align="center">暂无图片</Typography>
                    ) : (
                        <>
                            <PicturesGrid
                                canEdit={canEdit}
                                pictures={currentPictures}
                            />
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    mt: 4,
                                    mb: 2,
                                }}
                            >
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="large"
                                />
                            </Box>
                        </>
                    )}
                </Box>
            </Box>

            {/* 删除确认对话框 */}
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => !isDeleting && setDeleteDialogOpen(false)}
                title="确认删除"
                content="确定要删除这个图集吗？此操作无法撤销。"
                primaryButton={{
                    text: '删除',
                    onClick: handleDeleteAlbum,
                    disabled: isDeleting,
                }}
                secondaryButton={{
                    text: '取消',
                    onClick: () => setDeleteDialogOpen(false),
                    disabled: isDeleting,
                }}
            />
            {/* 编辑图片对话框 */}
            {canEdit && album && (
                <EditAlbumPictures
                    isOpen={editPicturesDialogOpen}
                    onClose={() => setEditPicturesDialogOpen(false)}
                    albumId={albumId}
                />
            )}
            {/* 编辑图集对话框 */}
            {canEdit && album && (
                <EditAlbumInfo
                    isOpen={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    album={album}
                    onSuccess={handleEditSuccess}
                />
            )}
        </Container>
    );
}
