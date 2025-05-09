'use client'
import { Box, Container, Typography, CircularProgress, Divider } from '@mui/material'
import { mutate } from 'swr'
import { PicturesGrid } from '@/app/_components/picture'
import { useState } from 'react'
import { EditAlbumPictures } from '@/app/_components/album'
import { useRouter } from 'next/navigation'
import { EditAlbumInfo } from '@/app/_components/album'
import { Picture, AlbumPicture } from '@/lib/interfaces/interfaces'
import { ConfirmDialog } from '@/app/_components/dialog'
import { AlbumDetailCard } from '@/app/_components/album'
import { useUser, useAlbum } from '@/lib/fetcher/fetchers'
import { useParams } from 'next/navigation'




export default function AlbumPage() {
    const albumId = Number(useParams().id)
    const { album, error: albumError, isLoading: albumLoading } = useAlbum(albumId)
    const { user, error: userError, isLoading: userLoading } = useUser()

    const canEdit = user?.id === album?.owner.id
    const [selectImageOpen, setSelectImageOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const router = useRouter()
    if (albumLoading || userLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (!album) {
        return <Typography align="center">图集不存在</Typography>
    }
    if (!user) {
        return <Typography align="center">请先登录</Typography>
    }
    if (album.isPrivate && album.owner.id !== user.id) {
        return <Typography align="center">你无权限访问这个图集</Typography>
    }

    const handlePictureClick = (picture: Picture) => {
        router.push(`/pictures/${picture.id}`)
    }

    const handleDeleteAlbum = async () => {
        try {
            if (!canEdit) {
                router.push(`/index/pictures`)
                return
            }
            setIsDeleting(true)
            const response = await fetch(`/api/my/albums/${albumId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error('删除图集失败')
            }

            router.push('/me')
        } catch (error) {
            alert(error instanceof Error ? error.message : '删除图集失败')
        } finally {
            setIsDeleting(false)
            setDeleteDialogOpen(false)
        }
    }

    const handleEditAlbum = () => {
        if (!canEdit) {
            router.push(`/index/pictures`)
            return
        }
        setEditDialogOpen(true)
    }

    const handleEditSuccess = () => {
        if (!canEdit) {
            router.push(`/index/pictures`)
            return
        }
        mutate(`/api/albums/${albumId}`)
        setEditDialogOpen(false)
    }

    const handleEditAlbumPictures = async (picturesToAdd: AlbumPicture[], picturesToRemove: AlbumPicture[]) => {
        const response = await fetch(`/api/my/albums/${albumId}`, {
            method: 'PUT',
            body: JSON.stringify({ addPictures: picturesToAdd, removePictures: picturesToRemove })
        })
        if (!response.ok) {
            throw new Error('编辑图集失败')
        }
        mutate(`/api/albums/${albumId}`)
        setSelectImageOpen(false)
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                {/* 图集信息区域 */}
                <AlbumDetailCard
                    album={album}
                    onAddPictures={() => setSelectImageOpen(true)}
                    onEdit={handleEditAlbum}
                    onDelete={() => setDeleteDialogOpen(true)}
                />

                {/* 分割线 */}
                <Divider sx={{ my: 4 }} />

                {/* 图片网格 */}
                <Box>
                    <PicturesGrid 
                        pictures={album.albumPictures} 
                        onImageClick={handlePictureClick} 
                    />
                </Box>
            </Box>

            {/* 选择图片对话框 */}
            <EditAlbumPictures
                isOpen={selectImageOpen}
                albumId={albumId}
                onClose={() => setSelectImageOpen(false)}
                onSubmit={handleEditAlbumPictures}
            />

            {/* 删除确认对话框 */}
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => !isDeleting && setDeleteDialogOpen(false)}
                title="确认删除"
                content="确定要删除这个图集吗？此操作无法撤销。"
                primaryButton={{
                    text: isDeleting ? '删除中...' : '删除',
                    onClick: handleDeleteAlbum
                }}
                secondaryButton={{
                    text: '取消',
                    onClick: () => setDeleteDialogOpen(false)
                }}
            />

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
