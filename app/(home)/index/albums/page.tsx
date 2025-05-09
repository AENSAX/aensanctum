'use client'

import { Box, Typography, CircularProgress } from '@mui/material'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { AlbumsGrid } from '@/app/_components/album'
import { Album } from '@/lib/interfaces/interfaces'

const fetcher = async (url: string) => {
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (!res.ok) {
        throw new Error('获取图集列表失败')
    }
    return res.json()
}

export default function AlbumsPage() {
    const router = useRouter()
    const { data: albums, error: albumsError, isLoading: albumsLoading } = useSWR<Album[]>('/api/albums', fetcher)
    const { data: user, error: authError, isLoading: userLoading } = useSWR('/api/auth/login', fetcher)

    if (albumsLoading || userLoading) {
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

    if (albumsError) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography color="error">{albumsError.message}</Typography>
            </Box>
        )
    }

    const handleAlbumClick = (album: Album) => {
        router.push(`/albums/${album.id}`)
    }

    return (
        <Box sx={{ mt: 4 }}>
            <AlbumsGrid 
                albums={albums || []} 
                onAlbumClick={handleAlbumClick}
            />
        </Box>
    )
}
