'use client'

import { Box, CircularProgress, Typography } from '@mui/material'
import { PicturesGrid } from '@/app/_components/picture'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { Picture } from '@/lib/interfaces/interfaces'

const fetcher = async (url: string) => {
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (!res.ok) {
        throw new Error('Failed to fetch pictures')
    }
    return res.json()
}

// 定义并导出 HomePage 组件
export default function HomePage() {
    const { data: pictures, error, isLoading } = useSWR<Picture[]>('/api/pictures', fetcher)
    const router = useRouter()

    if (error) return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '200px' 
        }}>
            <Typography color="error">加载图片失败</Typography>
        </Box>
    )
    
    if (isLoading) return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '200px' 
        }}>
            <CircularProgress />
        </Box>
    )
    if (!pictures) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '200px' 
            }}>
                <Typography color="error">没有图片</Typography>
            </Box>
        )
    }

    const handleImageClick = (picture: Picture) => {
        router.push(`/pictures/${picture.id}`)
    }

    return (
        <Box>
            <Box sx={{ mt: 4 }}>
                <PicturesGrid pictures={pictures} onImageClick={handleImageClick}/>
            </Box>
        </Box>
    )
}
