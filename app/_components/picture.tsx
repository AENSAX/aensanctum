'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormDialog, ConfirmDialog } from './dialog'
import { Picture } from '@/lib/interfaces/interfaces'
import { Typography, Container, Paper, Box, IconButton, FormControlLabel, Switch, Stack, Divider, Avatar } from '@mui/material'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { tagsFormater, useUser } from '@/lib/fetcher/fetchers'
import { mutate } from 'swr'
import Image from 'next/image'
import LockIcon from '@mui/icons-material/Lock'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'


//删除图片
interface DeletePictureProps {
    isOpen: boolean
    onClose: () => void
    picture: Picture
    onSuccess?: () => void
}

export function DeletePicture({ isOpen, onClose, picture, onSuccess }: DeletePictureProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            const response = await fetch(`/api/my/pictures/${picture.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (!response.ok) {
                throw new Error('删除失败')
            }

            if (onSuccess) {
                onSuccess()
            }
            router.push('/me')
        } catch (error) {
            throw new Error('删除失败')
        } finally {
            setIsDeleting(false)
            onClose()
        }
    }

    return (
        <ConfirmDialog
            isOpen={isOpen}
            onClose={() => !isDeleting && onClose()}
            title="确认删除"
            content="确定要删除这张图片吗？此操作无法撤销。"
            primaryButton={{
                text: isDeleting ? '删除中...' : '删除',
                onClick: handleDelete
            }}
            secondaryButton={{
                text: '取消',
                onClick: onClose
            }}
        />
    )
}

//编辑图片
interface EditPictureProps {
    isOpen: boolean
    onClose: () => void
    picture: Picture | null
    onSuccess?: () => void
}

export function EditPicture({ isOpen, onClose, picture, onSuccess }: EditPictureProps) {
    const [isPrivate, setIsPrivate] = useState(false)
    const [showPrivacyConfirm, setShowPrivacyConfirm] = useState(false)
    const [responseError, setResponseError] = useState<string>('')

    // 初始化表单
    useEffect(() => {
        if (picture) {
            setIsPrivate(picture.isPrivate)
        }
    }, [picture, open])

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
        if (!picture) return
        try {
            const response = await fetch(`/api/my/pictures/${picture.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: data.title,
                    tags: tagsFormater(data.tags),
                    isPrivate,
                }),
            })
            if (!response.ok) {
                setResponseError('编辑失败')
                return
            }
            if (onSuccess) {
                mutate(`/api/pictures/${picture.id}`)
                onSuccess()
            }
            onClose()
        } catch (error) {
            throw error
        }
    }

    const pictureFields = [
        {
            name: 'title',
            label: '标题',
            type: 'text',
            required: true,
            defaultValue: picture?.title || '',
            validation: {
                pattern: /^(?!.*\s{2,})[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/,
                error: '图片标题只能包含中英文、数字、非连续空格和横杠'
            }
        },
        {
            name: 'tags',
            label: '标签',
            type: 'text',
            required: false,
            defaultValue: picture?.tags.join(' '),
            placeholder: '请输入标签，用空格分隔',
            validation: {
                pattern: /^(?!.*\s{2,})[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/,
                error: '标签只能包含中英文、数字、非连续空格和横杠'
            }
        }
    ]

    return (
        <>
            <FormDialog
                title="编辑图片信息"
                isOpen={isOpen}
                onClose={onClose}
                fields={pictureFields}
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
                content="设为私密后，只有您可以看到这张图片。确定要设为私密吗？"
                primaryButton={{ text: '确定', onClick: handleConfirmPrivacy }}
                secondaryButton={{ text: '取消', onClick: () => setShowPrivacyConfirm(false) }}
            />
        </>
    )
}

//图片详情卡片
export function PictureDetailCard({ picture, onEdit, onDelete }: { picture: Picture, onEdit: () => void, onDelete: () => void }) {
    const { user, isLoading: userLoading, error: userError } = useUser()
    if (userLoading || userError) {
        return <Typography align="center">加载中...</Typography>
    }
    const canEdit = user?.id === picture.owner.id

    return (
        <Container maxWidth="xl" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper
                elevation={3}
                sx={{
                    display: 'flex',
                    maxWidth: 1200,
                    overflow: 'hidden',
                }}
            >
                <Image
                    src={picture.url}
                    alt={picture.title}
                    width={800}
                    height={600}
                    style={{
                        maxWidth: '80vw',
                        maxHeight: '80vh',
                        height: 'auto',
                        width: 'auto',
                        display: 'block',
                    }}
                    priority
                />
                <Stack
                    spacing={2}
                    sx={{
                        minWidth: 400,
                        maxWidth: 500,
                        p: 3,
                        borderLeft: '1px solid',
                        borderColor: 'divider',
                        flexShrink: 0,
                        justifyContent: 'flex-start',
                    }}
                >
                    <Typography variant="h4" component="h2">
                        {picture.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        创建于 {picture?.createdAt ? formatDistanceToNow(new Date(picture.createdAt), { locale: zhCN, addSuffix: true }) : '未知时间'}
                    </Typography>
                    {picture.tags?.length > 0 && (
                        <Typography variant="body1" color="text.secondary">
                            #{picture.tags.join('#')}
                        </Typography>
                    )}
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {picture.owner.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body1" color="text.secondary">
                                {picture.owner.name} 上传
                            </Typography>
                        </Stack>
                        {canEdit && (
                            <Box>
                                <IconButton
                                    onClick={onEdit}
                                    size="small"
                                    sx={{ mr: 1 }}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    onClick={onDelete}
                                    size="small"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        )}
                    </Box>
                </Stack>
            </Paper>
        </Container>
    )
}

//图片网格
interface PictureGridProps<T extends Picture = Picture> {
    pictures: T[]
    onImageClick?: (picture: T) => void
    customImageRender?: (picture: T) => React.ReactNode
}

export function PicturesGrid<T extends Picture = Picture>({ pictures, onImageClick, customImageRender }: PictureGridProps<T>) {
    if (!pictures) {
        return <Typography align="center">没有图片</Typography>
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
            {pictures.map(pic => (
                <Box
                    key={pic.id}
                    sx={{
                        cursor: onImageClick ? 'pointer' : 'default',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                            transform: 'scale(1.02)'
                        }
                    }}
                    onClick={() => onImageClick?.(pic)}
                >
                    {customImageRender ? customImageRender(pic) : (
                        <>
                            <Box
                                sx={{
                                    position: 'relative',
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                    }
                                }}
                            >
                                <Image
                                    src={pic.url}
                                    alt={pic.title}
                                    width={500}
                                    height={500}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        objectFit: 'cover'
                                    }}
                                    priority={false}
                                    loading="lazy"
                                />
                            </Box>
                            {/* 如果图片是私有的，则显示锁图标 */}
                            {pic.isPrivate && (
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
                    )}
                </Box>
            ))}
        </Box>
    )
}