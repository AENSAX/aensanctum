'use client'
import { Box, Container, Typography, CircularProgress, Divider } from '@mui/material'
import { mutate } from 'swr'
import { PicturesGrid } from '@/app/_components/picture'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditAlbumInfo, EditAlbumPictures } from '@/app/_components/album'
import { ConfirmDialog } from '@/app/_components/dialog'
import { AlbumDetailCard } from '@/app/_components/album'
import { useUser, useAlbum } from '@/lib/fetcher/fetchers'
import { useParams } from 'next/navigation'


export default function AlbumPage() {
    const albumId = useParams().id as string
    const { album, albumErrors, albumLoading } = useAlbum(albumId)
    const { user, userErrors, userLoading } = useUser()

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editPicturesDialogOpen, setEditPicturesDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteDialogExternalError, setDeleteDialogExternalError] = useState<{ field: string, message: string }[]>([])

    const router = useRouter()
    if (albumLoading || userLoading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px'
            }}>
                <CircularProgress />
            </Box>
        )
    }
    if (albumErrors && albumErrors.length > 0) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                {albumErrors.map((error: { field: string, message: string }) => (
                    <Typography key={error.field} color="error">{error.message}</Typography>
                ))}
            </Box>
        )
    }
    if (userErrors && userErrors.length > 0) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                {userErrors.map((error: { field: string, message: string }) => (
                    <Typography key={error.field} color="error">{error.message}</Typography>
                ))}
            </Box>
        )
    }
    if (!album) {
        return <Typography align="center">图集不存在</Typography>
    }
    if (!user) {
        return <Typography align="center">请先登录</Typography>
    }
    const canEdit = user.id === album.ownerId


    if (album.isPrivate && !canEdit) {
        return <Typography align="center">你无权限访问这个图集</Typography>
    }

    const handleDeleteAlbum = async () => {
        setIsDeleting(true)
        const response = await fetch(`/api/my/albums/${albumId}`, {
            method: 'DELETE',
        })

        if (!response.ok) {
            const result = await response.json()
            setDeleteDialogExternalError(result.errors)
            setIsDeleting(false)
            return
        }

        router.push('/me')
        setIsDeleting(false)
        setDeleteDialogOpen(false)
    }

    const handleEditSuccess = () => {
        mutate(`/api/albums/${albumId}`)
        setEditDialogOpen(false)
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                {/* 图集信息区域 */}
                <AlbumDetailCard
                    albumId={albumId}
                    onAddPictures={() => setEditPicturesDialogOpen(true)}
                    onEdit={() => setEditDialogOpen(true)}
                    onDelete={() => setDeleteDialogOpen(true)}
                />

                {/* 分割线 */}
                <Divider sx={{ my: 4 }} />

                {/* 图片网格 */}
                <Box>
                    <PicturesGrid
                        albumId={album.id}
                        pictures={album.pictures}
                    />
                </Box>
            </Box>

            {/* 删除确认对话框 */}
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => !isDeleting && setDeleteDialogOpen(false)}
                title="确认删除"
                content="确定要删除这个图集吗？此操作无法撤销。"
                externalError={deleteDialogExternalError}
                primaryButton={{
                    text: '删除',
                    onClick: handleDeleteAlbum,
                    disabled: isDeleting
                }}
                secondaryButton={{
                    text: '取消',
                    onClick: () => setDeleteDialogOpen(false),
                    disabled: isDeleting
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
    )
}
