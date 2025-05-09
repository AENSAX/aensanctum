'use client'
import { Box, Typography, Button, IconButton, FormControlLabel, Switch, Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import EditIcon from '@mui/icons-material/Edit'
import LockIcon from '@mui/icons-material/Lock'
import DeleteIcon from '@mui/icons-material/Delete'
import { useTheme } from '@mui/material/styles'
import { Album, AlbumPicture, Picture } from '@/lib/interfaces/interfaces'
import { tagsFormater, useAlbum, useMyPictures, useUser } from '@/lib/fetcher/fetchers'
import { useEffect, useState } from 'react'
import { mutate } from 'swr'
import { ConfirmDialog,FormDialog } from './dialog'
import { PicturesGrid } from './picture'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

//图集信息卡片
interface AlbumDetailCardProps {
    album: Album
    onAddPictures: () => void
    onEdit: () => void
    onDelete: () => void
}

export function AlbumDetailCard({
    album,
    onAddPictures,
    onEdit,
    onDelete
}: AlbumDetailCardProps) {
    const theme = useTheme()
    const { user } = useUser()

    const canEdit = user?.id == album?.owner.id

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
                {album.albumPictures.length > 0 ? (
                    <Image
                        src={album.albumPictures[0].url}
                        alt={album.albumPictures[0].title}
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
                        backgroundColor: theme.palette.primary.main,
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
                    {album.albumPictures.length} 张图片
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
                                    bgcolor: 'primary.main',
                                    '&:hover': {
                                        bgcolor: 'primary.dark'
                                    }
                                }}
                            >
                                添加图片
                            </Button>
                            <IconButton
                                onClick={onEdit}
                                color="primary"
                                sx={{
                                    bgcolor: 'primary.light',
                                    '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: 'white'
                                    }
                                }}
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton
                                onClick={onDelete}
                                color="error"
                                sx={{
                                    bgcolor: 'error.light',
                                    '&:hover': {
                                        bgcolor: 'error.main',
                                        color: 'white'
                                    }
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    )
}



//图集显示网格
export function AlbumsGrid({ albums, onAlbumClick }: { albums: Album[], onAlbumClick?: (album: Album) => void }) {

    if (!albums || albums.length === 0) {
        return (
            <Typography align="center">暂无图集</Typography>
        )
    }

    const handleAlbumClick = (album: Album) => {
        if (onAlbumClick) {
            onAlbumClick(album)
        }
    }

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
                    onClick={() => handleAlbumClick(album)}
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
                    {album.albumPictures.length > 0 ? (
                        <>
                            <Image
                                src={album.albumPictures[0].url}
                                alt={album.albumPictures[0].title}
                                width={500}
                                height={500}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.2s ease',
                                }}
                            />
                            {/* 如果图集是私有的，则显示锁 */}
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
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: 8,
                                    bottom: 8,
                                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                                    color: 'white',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: '4px',
                                    fontSize: '0.875rem',
                                    maxWidth: 'calc(100% - 90px)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {album.name}
                            </Box>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    bottom: 8,
                                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                                    color: 'white',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: '4px',
                                    fontSize: '0.625rem',
                                }}
                            >
                                {album.albumPictures.length} 张图片
                            </Box>
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
                            暂无图片
                        </Box>
                    )}
                </Box>
            ))}
        </Box>
    )
}

//编辑图集信息
interface EditAlbumProps {
    isOpen: boolean
    onClose: () => void
    album: {
        id: number
        name: string
        tags: string[]
        isPrivate: boolean
    }
    onSuccess?: () => void
}
export function EditAlbumInfo({ isOpen, onClose, album, onSuccess }: EditAlbumProps) {
    const [isPrivate, setIsPrivate] = useState(false)
    const [showPrivacyConfirm, setShowPrivacyConfirm] = useState(false)

    // 初始化表单
    useEffect(() => {
        if (album) {
            setIsPrivate(album.isPrivate)
        }
    }, [album, isOpen])


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
    const [responseError, setResponseError] = useState<string>('')
    const handleSubmit = async (data: any) => {
        if (!album) return
        try {
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
                setResponseError('编辑失败')
            }
            if (onSuccess) {
                mutate(`/api/albums/${album.id}`)
                onSuccess()
            }
            onClose()
        } catch (error) {
            throw error
        }
    }

    const albumFields = [
        {
            name: 'name',
            label: '图集名称',
            type: 'text',
            required: true,
            defaultValue: album?.name || '',
            validation: {
                pattern: /^(?!.*\s{2,})[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/,
                error: '图集名称只能包含中英文、数字、非连续空格和横杠'
            }
        },
        {
            name: 'tags',
            label: '标签',
            type: 'text',
            required: true,
            defaultValue: album?.tags.join(' '),
            placeholder: '请输入图片标签,用空格分隔',
            validation: {
                pattern: /^(?!.*\s{2,})[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/,
                error: '标签只能包含中英文、数字、非连续空格和横杠'
            }
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

//编辑图集图片
interface EditAlbumPicturesProps {
    isOpen: boolean
    albumId: number
    onClose: () => void
    onSubmit: (picturesToAdd: AlbumPicture[], picturesToRemove: AlbumPicture[]) => void
}

export function EditAlbumPictures({isOpen, albumId, onClose, onSubmit}: EditAlbumPicturesProps) {
    const { user, error: userError, isLoading: userLoading } = useUser()
    const { album, error: albumError, isLoading: albumLoading } = useAlbum(albumId)
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
            <Dialog open={isOpen} maxWidth="lg" fullWidth>
                <DialogContent>
                    <Typography align="center" sx={{ py: 4 }}>加载中...</Typography>
                </DialogContent>
            </Dialog>
        )
    }
    if (picturesError || !pictures) {
        return (
            <Dialog open={isOpen} maxWidth="lg" fullWidth>
                <DialogContent>
                    <Typography align="center" color="error" sx={{ py: 4 }}>加载失败</Typography>
                </DialogContent>
            </Dialog>
        )
    }

    if (!pictures || pictures.length === 0) {
        return (
            <Dialog open={isOpen} maxWidth="lg" fullWidth>
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