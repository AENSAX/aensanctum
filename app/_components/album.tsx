'use client'
import { Box, Typography, Button, IconButton, FormControlLabel, Switch, Dialog, DialogContent, DialogTitle, DialogActions, CircularProgress, Alert } from '@mui/material'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { de, zhCN } from 'date-fns/locale'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import EditIcon from '@mui/icons-material/Edit'
import LockIcon from '@mui/icons-material/Lock'
import DeleteIcon from '@mui/icons-material/Delete'
import { AlbumDetail, Album } from '@/lib/interfaces/interfaces'
import { tagsFormater, useUser } from '@/lib/fetcher/fetchers'
import { useState, useRef } from 'react'
import { mutate } from 'swr'
import { ConfirmDialog, FormDialog } from './dialog'
import { useAlbum } from '@/lib/fetcher/fetchers'
import Link from 'next/link'

//图集信息卡片
interface AlbumDetailCardProps {
    albumId: string
    onAddPictures: () => void
    onEdit: () => void
    onDelete: () => void
}

export function AlbumDetailCard({
    albumId,
    onAddPictures,
    onEdit,
    onDelete
}: AlbumDetailCardProps) {
    const { user, userErrors, userLoading } = useUser()
    const { album, albumErrors, albumLoading } = useAlbum(albumId)
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
    if (userErrors && userErrors.length > 0) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                {userErrors.map((error: { field: string, message: string }) => (
                    <Typography key={error.field} color="error">{error.message}</Typography>
                ))}
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
    if (!user) {
        return <Typography align="center">请先登录</Typography>
    }
    if (!album) {
        return <Typography align="center">图集不存在</Typography>
    }

    const canEdit = user.id == album.ownerId

    return (
        <Box sx={{
            display: 'flex',
            gap: 4,
            mb: 6,
            flexDirection: { xs: 'column', md: 'row' }
        }}>
            {/* 封面图片 */}
            <Box sx={{
                width: { xs: '100%', md: '300px' },
                height: { xs: '200px', md: '300px' },
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                flexShrink: 0
            }}>
                {album.pictures.length > 0 ? (
                    <Image
                        src={album.pictures[0].url}
                        alt={`${album.id}`}
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <Box sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.200'
                    }}>
                        <Typography color="text.secondary">暂无封面</Typography>
                    </Box>
                )}
            </Box>

            {/* 图集信息 */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
                    {album.name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 2
                    }}>
                        {album.owner.name.charAt(0).toUpperCase()}
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                        {album.owner.name} 创建
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                        {album?.createdAt ? formatDistanceToNow(new Date(album.createdAt), { locale: zhCN, addSuffix: true }) : '未知时间'}
                    </Typography>
                </Box>

                <Typography variant="body1" sx={{ mb: 2 }}>
                    {album.pictures.length} 张图片
                </Typography>

                {album?.tags?.length > 0 && (
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        #{album.tags.join('#')}
                    </Typography>
                )}

                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    {canEdit && (
                        <>
                            <Button
                                variant="contained"
                                startIcon={<AddPhotoAlternateIcon />}
                                onClick={onAddPictures}
                                sx={{
                                    minWidth: 120,
                                    height: 45,
                                    bgcolor: 'primary.main',
                                    '&:hover': {
                                        bgcolor: 'primary.dark'
                                    }
                                }}
                            >
                                添加图片
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={onEdit}
                                sx={{
                                    minWidth: 120,
                                    height: 45,
                                    bgcolor: 'primary.main',
                                    '&:hover': {
                                        bgcolor: 'primary.dark'
                                    }
                                }}
                            >
                                编辑信息
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={onDelete}
                                sx={{
                                    minWidth: 120,
                                    height: 45,
                                    borderColor: 'error.main',
                                    color: 'error.main',
                                    '&:hover': {
                                        bgcolor: 'error.light',
                                        borderColor: 'error.dark',
                                        color: 'error.dark'
                                    }
                                }}
                            >
                                删除图集
                            </Button>
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    )
}

//图集显示网格
export function AlbumsGrid({ albums }: { albums: Album[] }) {
    return (
        <Box
            sx={{
                columnCount: {
                    xs: 2,
                    sm: 3,
                    md: 4,
                    lg: 5
                },
                columnGap: '8px',
                padding: '4px',
                '& > *': {
                    marginBottom: '8px',
                    breakInside: 'avoid',
                    display: 'block'
                }
            }}
        >
            {albums.map((album) => (
                <Box
                    key={album.id}
                    sx={{
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                            transform: 'scale(1.02)'
                        }
                    }}
                >
                    <Link href={`/albums/${album.id}`}>
                        {album.pictures.length > 0 ? (
                            <>
                                <Image
                                    src={album.pictures[0].url}
                                    alt={`${album.id}`}
                                    width={500}
                                    height={500}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        display: 'block',
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                        transition: 'all 0.2s ease'
                                    }}
                                />
                                {album.isPrivate && (
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
                            </>
                        ) : (
                            <Box
                                sx={{
                                    width: '100%',
                                    aspectRatio: '1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'grey.200',
                                    borderRadius: '12px',
                                    color: 'text.secondary'
                                }}
                            >
                                暂无封面
                            </Box>
                        )}
                    </Link>
                </Box>
            ))}
        </Box>
    )
}

//编辑图集图片
interface EditAlbumPicturesProps {
    isOpen: boolean
    onClose: () => void
    albumId: string
}

export function EditAlbumPictures({ isOpen, onClose, albumId }: EditAlbumPicturesProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<{ field: string, message: string }[]>([])
    const [pictureList, setPictureList] = useState<File[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 处理文件选择
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        if (files.length > 10) {
            setUploadError([{ field: 'images', message: '一次最多只能上传10张图片' }])
            return
        }
        setPictureList(Array.from(files))
        setUploadError([])
    }

    const handleUpload = async () => {
        if (pictureList.length === 0) return
        setIsUploading(true)
        const formData = new FormData()
        pictureList.forEach((file) => {
            formData.append('images', file)
        })
        const response = await fetch(`/api/my/albums/${albumId}`, {
            method: 'POST',
            body: formData,
        })
        if (!response.ok) {
            const result = await response.json()
            setUploadError(result.errors)
        }
        setIsUploading(false)
        mutate(`/api/albums/${albumId}`)
        setPictureList([])
        onClose()
    }

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>添加图片</DialogTitle>
            <DialogContent>
                <Box sx={{ 
                    mt: 2, 
                    mb: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                    />
                    
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <Button
                            variant="contained"
                            component="label"
                            disabled={isUploading}
                            startIcon={<AddPhotoAlternateIcon />}
                            onClick={() => fileInputRef.current?.click()}
                            sx={{ 
                                minWidth: 120,
                                height: 45,
                                bgcolor: 'primary.main',
                                '&:hover': {
                                    bgcolor: 'primary.dark'
                                }
                            }}
                        >
                            选择图片
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={isUploading || pictureList.length === 0}
                            sx={{ 
                                minWidth: 120,
                                height: 45,
                                bgcolor: 'primary.main',
                                '&:hover': {
                                    bgcolor: 'primary.dark'
                                }
                            }}
                        >
                            {isUploading ? '上传中...' : '上传'}
                        </Button>
                    </Box>

                    {pictureList.length > 0 && (
                        <Box sx={{
                            mt: 2,
                            p: 2,
                            borderRadius: 1,
                            bgcolor: 'grey.50',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                                已选择 {pictureList.length} 张图片
                            </Typography>
                            {pictureList.map((file) => (
                                <Typography 
                                    key={file.name} 
                                    variant="body2"
                                    sx={{
                                        py: 0.5,
                                        px: 1,
                                        borderRadius: 0.5,
                                        '&:hover': {
                                            bgcolor: 'grey.100'
                                        }
                                    }}
                                >
                                    {file.name}
                                </Typography>
                            ))}
                        </Box>
                    )}

                    {uploadError && uploadError.map((error) => (
                        <Alert 
                            key={error.field} 
                            severity="error"
                            sx={{
                                '& .MuiAlert-message': {
                                    width: '100%'
                                }
                            }}
                        >
                            {error.message}
                        </Alert>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button 
                    onClick={onClose} 
                    variant="outlined"
                    sx={{ 
                        minWidth: 120,
                        height: 45
                    }}
                >
                    取消
                </Button>
            </DialogActions>
        </Dialog>
    )
}

//编辑图集信息
interface EditAlbumProps {
    isOpen: boolean
    onClose: () => void
    album: AlbumDetail
    onSuccess?: () => void
}

export function EditAlbumInfo({ isOpen, onClose, album, onSuccess }: EditAlbumProps) {
    const [isPrivate, setIsPrivate] = useState(album.isPrivate)
    const [showPrivacyConfirm, setShowPrivacyConfirm] = useState(false)
    const [responseError, setResponseError] = useState<{ field: string, message: string }[]>([])

    // 处理隐私设置变更
    const handlePrivacyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setShowPrivacyConfirm(true)
        } else {
            setIsPrivate(false)
        }
    }

    // 确认设置隐私
    const handleConfirmPrivacy = () => {
        setIsPrivate(true)
        setShowPrivacyConfirm(false)
    }

    // 处理提交
    const handleSubmit = async (data: any) => {
        const response = await fetch(`/api/my/albums/${album.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: data.name,
                tags: tagsFormater(data.tags),
                isPrivate,
            }),
        })
        if (!response.ok) {
            const result = await response.json()
            setResponseError(result.errors)
        }
        if (onSuccess) {
            mutate(`/api/albums/${album.id}`)
            onSuccess()
        }
        onClose()
    }

    const albumFields = [
        {
          name: 'name',
          label: '图集名称',
          type: 'text',
          required: true,
          placeholder: '请输入图集名称',
          defaultValue: album.name,
          validation: {
            pattern: /^[a-zA-Z0-9\u4e00-\u9fa5\- ]{1,100}$/,
            error: '图集名称只能包含中英文、数字、空格和横杠，长度在1-100个字符之间'
          },
          maxLength: 100
        },
        {
          name: 'tags',
          label: '图集标签',
          defaultValue: album.tags.join(' '),
          type: 'text',
          required: true,
          placeholder: '请输入图集标签，用空格分隔（1-10个标签，每个标签1-20字符）',
          validation: {
            pattern: /^[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/,
            error: '标签只能包含中英文、数字、空格和横杠'
          },
          helperText: '输入1-10个标签，每个标签长度在1-20个字符之间'
        }
      ]

    return (
        <>
            <FormDialog
                title="编辑图集信息"
                isOpen={isOpen}
                onClose={onClose}
                fields={albumFields}
                onSubmit={handleSubmit}
                externalError={responseError}
            >
                <FormControlLabel
                    control={
                        <Switch
                            checked={isPrivate}
                            onChange={handlePrivacyChange}
                            color="primary"
                        />
                    }
                    label="设为私密"
                />
            </FormDialog>

            <ConfirmDialog
                isOpen={showPrivacyConfirm}
                onClose={() => setShowPrivacyConfirm(false)}
                title="确认设为私密"
                content="设为私密后，只有您可以看到这个图集。确定要设为私密吗？"
                primaryButton={{ text: '确定', onClick: handleConfirmPrivacy }}
                secondaryButton={{ text: '取消', onClick: () => setShowPrivacyConfirm(false) }}
            />
        </>
    )
}
