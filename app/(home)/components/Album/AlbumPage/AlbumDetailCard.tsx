'use client'

import { Box, Typography, Button, IconButton } from '@mui/material'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useTheme } from '@mui/material/styles'
import { Album } from '@/lib/interfaces/interfaces'
import { useUser } from '@/lib/fetcher/fetchers'

interface AlbumDetailCardProps {
    album: Album
    onAddPictures: () => void
    onEdit: () => void
    onDelete: () => void
}

export default function AlbumDetailCard({ 
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
                                color='primary'
                            >
                                添加图片
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={onEdit}
                                color='secondary'
                            >
                                编辑
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<DeleteIcon />}
                                onClick={onDelete}
                                color='error'
                            >
                                删除
                            </Button>
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    )
}
