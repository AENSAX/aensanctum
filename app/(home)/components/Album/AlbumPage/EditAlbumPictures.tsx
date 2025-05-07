'use client'

import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'
import PicturesGrid from '@/app/(home)/components/Picture/PictureGrid/PicturesGrid'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LockIcon from '@mui/icons-material/Lock'
import { Picture, AlbumPicture, Album } from '@/lib/interfaces/interfaces'
import { useEffect, useState } from 'react'
import { useUser, useAlbum, useMyPictures } from '@/lib/fetcher/fetchers'


interface EditAlbumPicturesProps {
    isOpen: boolean
    albumId: number
    onClose: () => void
    onSubmit: (picturesToAdd: AlbumPicture[], picturesToRemove: AlbumPicture[]) => void
}

export default function EditAlbumPictures({isOpen, albumId, onClose, onSubmit}: EditAlbumPicturesProps) {
    const { user, error: userError, isLoading: userLoading } = useUser()
    const { data: album, error: albumError, isLoading: albumLoading } = useAlbum(albumId)
    const { pictures, error: picturesError, isLoading: picturesLoading } = useMyPictures()
    const [selectedPictures, setSelectedPictures] = useState<AlbumPicture[]>([])

    const canEdit = user?.id == album?.owner.id

    useEffect(() => {
        if (album?.albumPictures && selectedPictures.length === 0) {
            setSelectedPictures(album.albumPictures)
        }
    }, [album?.albumPictures])

    const originalPictures = album?.albumPictures || []

    // 处理关闭操作的函数 - 重置为初始状态
    const handleClose = () => {
        setSelectedPictures([])
        onClose()
    }

    // 处理图片点击事件的函数（选择/取消选择）
    const handlePictureClick = (picture: Picture) => {
        setSelectedPictures(prev => {
            const isSelected = prev.some(p => p.id === picture.id)
            if (isSelected) {
                return prev.filter(p => p.id !== picture.id)
                    .map((p, index) => ({ ...p, order: index }))
            } else {
                return [...prev, { ...picture, order: prev.length }]
            }
        })
    }

    const handleSubmit = () => {
        if (!canEdit) return
        // 找出需要添加的图片：新选择的图片中，id 不在原图片中，或者 id 相同但 order 不同的
        const picturesToAdd = selectedPictures.filter(p => 
            !originalPictures.some((op: AlbumPicture) => op.id === p.id && op.order === p.order)
        )
        // 找出需要删除的图片：原图片中，id 不在新选择的图片中，或者 id 相同但 order 不同的
        const picturesToRemove = originalPictures.filter((op: AlbumPicture) => 
            !selectedPictures.some(p => p.id === op.id && p.order === op.order)
        )
        onSubmit(picturesToAdd, picturesToRemove)
    }
    if (picturesLoading) {
        return (
            <Dialog open={isOpen} maxWidth="lg" fullWidth onClose={handleClose}>
                <DialogContent>
                    <Typography align="center" sx={{ py: 4 }}>加载中...</Typography>
                </DialogContent>
            </Dialog>
        )
    }
    if (picturesError || !pictures) {
        return (
            <Dialog open={isOpen} maxWidth="lg" fullWidth onClose={handleClose}>
                <DialogContent>
                    <Typography align="center" color="error" sx={{ py: 4 }}>加载失败</Typography>
                </DialogContent>
            </Dialog>
        )
    }

    if (!pictures || pictures.length === 0) {
        return (
            <Dialog open={isOpen} maxWidth="lg" fullWidth onClose={handleClose}>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography>你还没有上传任何图片</Typography>
                    </Box>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    minHeight: '80vh',
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle>选择图片</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <PicturesGrid<Picture>
                        pictures={pictures}
                        onImageClick={handlePictureClick}
                        customImageRender={(picture) => {
                            const isSelected = selectedPictures.some(p => p.id === picture.id)
                            const order = selectedPictures.find(p => p.id === picture.id)?.order
                            return (
                                <Box sx={{ position: 'relative' }}>
                                    <Box
                                        component="img"
                                        src={picture.url}
                                        alt={picture.title}
                                        sx={{
                                            width: '100%',
                                            height: 'auto',
                                            display: 'block',
                                            borderRadius: '12px',
                                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                            }
                                        }}
                                    />
                                    {isSelected && (
                                        <>
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    bgcolor: 'rgba(25, 118, 210, 0.3)',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <CheckCircleIcon
                                                    sx={{
                                                        color: 'white',
                                                        fontSize: 40,
                                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                                    }}
                                                />
                                            </Box>
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    left: 8,
                                                    backgroundColor: 'rgba(25, 118, 210, 0.8)',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    width: 24,
                                                    height: 24,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(25, 118, 210, 1)'
                                                    }
                                                }}
                                            >
                                                {order}
                                            </Box>
                                        </>
                                    )}
                                    {picture.isPrivate && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                borderRadius: '50%',
                                                padding: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <LockIcon sx={{ color: 'white', fontSize: 16 }} />
                                        </Box>
                                    )}
                                </Box>
                            )
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>取消</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                >
                    确认 ({selectedPictures.length})
                </Button>
            </DialogActions>
        </Dialog>
    )
}
