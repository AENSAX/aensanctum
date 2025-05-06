import { Box, Typography } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import Image from 'next/image'
import { Picture } from '@/lib/interfaces/interfaces'

interface PictureGridProps<T extends Picture = Picture> {
    pictures: T[]
    onImageClick?: (picture: T) => void
    customImageRender?: (picture: T) => React.ReactNode
}

export default function ImageGrid<T extends Picture = Picture>({ pictures, onImageClick, customImageRender }: PictureGridProps<T>) {
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
