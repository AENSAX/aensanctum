'use client'

import { Box, Typography } from '@mui/material'
import Image from 'next/image'
import LockIcon from '@mui/icons-material/Lock'
import { Album } from '@/lib/interfaces/interfaces'


interface AlbumsGridProps {
    albums: Album[]
    onAlbumClick?: (album: Album) => void
}

export default function AlbumsGrid({ albums, onAlbumClick }: AlbumsGridProps) {

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
