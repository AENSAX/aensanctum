'use client'

import { Divider, Typography, IconButton, Box, useTheme, Container, Paper, Stack, Avatar } from "@mui/material"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import useSWR from "swr"
import { Picture } from "@/lib/interfaces/interfaces"
import Image from 'next/image'

interface User {
    id: number
    name: string
    email: string
}

interface PictureDetailCardProps {
    picture: Picture
    onEdit: () => void
    onDelete: () => void
}

const fetcher = async (url: string) => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    return response.json()
}

export default function PictureDetailCard({ picture, onEdit, onDelete }: PictureDetailCardProps) {
    const { data: user, isLoading: userLoading, error: userError } = useSWR<User>('/api/auth/login', fetcher)
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
