'use client';

import { Picture } from '@/lib/types';
import {
    Typography,
    Box,
    Dialog,
    IconButton,
    CircularProgress,
} from '@mui/material';
import Image from 'next/image';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useState } from 'react';
import { useUser } from '@/lib/fetchers';
import { ConfirmDialog } from './dialog';
import { mutate } from 'swr';

interface ImagePreviewProps {
    open: boolean;
    onClose: () => void;
    image: Picture;
    onPrevious: () => void; // 切换到上一张
    onNext: () => void; // 切换到下一张
    hasPrevious: boolean; // 是否有上一张
    hasNext: boolean;
}

function ImagePreview({
    open,
    onClose,
    image,
    onPrevious,
    onNext,
    hasPrevious,
    hasNext,
}: ImagePreviewProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            fullWidth
            transitionDuration={300}
            slotProps={{
                paper: {
                    sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.9)',
                        position: 'relative',
                        height: '100vh',
                        m: 0,
                    },
                },
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 1,
                }}
            >
                <IconButton
                    onClick={onClose}
                    sx={{
                        color: 'white',
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* 左右切换按钮 */}
            <Box
                sx={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                }}
            >
                <IconButton
                    onClick={onPrevious}
                    disabled={!hasPrevious}
                    sx={{
                        color: 'white',
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                        },
                        '&.Mui-disabled': {
                            display: 'none',
                        },
                    }}
                >
                    <NavigateBeforeIcon />
                </IconButton>
            </Box>

            <Box
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                }}
            >
                <IconButton
                    onClick={onNext}
                    disabled={!hasNext}
                    sx={{
                        color: 'white',
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                        },
                        '&.Mui-disabled': {
                            display: 'none',
                        },
                    }}
                >
                    <NavigateNextIcon />
                </IconButton>
            </Box>

            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        width: '90%',
                        height: '90%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Image
                        unoptimized
                        src={image.url}
                        alt={`图片${image.id}`}
                        fill
                        style={{
                            objectFit: 'contain',
                        }}
                        priority
                    />
                </Box>
            </Box>
        </Dialog>
    );
}

export function PicturesGrid({
    pictures,
    canEdit,
}: {
    pictures: Picture[];
    canEdit: boolean;
}) {
    const [selectedPicture, setSelectedPicture] = useState<Picture | null>(
        null,
    );
    const [selectedPictureToDelete, setSelectedPictureToDelete] =
        useState<Picture | null>(null);
    const { user, userErrors, userLoading } = useUser();
    const [deletePictureConfirm, setDeletePictureConfirm] = useState(false);
    const [pictureDeleting, setPictureDeleting] = useState(false);

    const currentIndex = selectedPicture
        ? pictures.findIndex((p) => p.id === selectedPicture.id)
        : -1;

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setSelectedPicture(pictures[currentIndex - 1]);
        }
    };

    const handleNext = () => {
        if (currentIndex < pictures.length - 1) {
            setSelectedPicture(pictures[currentIndex + 1]);
        }
    };

    if (userLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }
    if (userErrors && userErrors.length > 0) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                {userErrors.map((error: { field: string; message: string }) => (
                    <Typography key={error.field} color="error">
                        {error.message}
                    </Typography>
                ))}
            </Box>
        );
    }
    if (!user) {
        return <Typography align="center">未登录</Typography>;
    }

    if (!pictures || pictures.length === 0) {
        return <Typography align="center">没有图片</Typography>;
    }

    const handleImageClick = (pic: Picture) => {
        setSelectedPicture(pic);
    };
    const handleImageDelete = async () => {
        setPictureDeleting(true);
        const res = await fetch(
            `/api/my/albums/${String(selectedPictureToDelete?.albumId)}/pictures/${String(selectedPictureToDelete?.id)}`,
            {
                method: 'DELETE',
            },
        );
        if (!res.ok) {
            const result = await res.json();
            setPictureDeleting(false);
            throw result;
        }
        setPictureDeleting(false);
        setDeletePictureConfirm(false);
        mutate(`/api/albums/${String(selectedPictureToDelete?.albumId)}`);
    };

    const handleClose = () => {
        setSelectedPicture(null);
    };

    return (
        <>
            <Box
                sx={{
                    columnCount: {
                        xs: 2,
                        sm: 3,
                        md: 4,
                        lg: 5,
                    },
                    columnGap: '8px',
                    padding: '4px',
                    '& > *': {
                        marginBottom: '8px',
                        breakInside: 'avoid',
                        display: 'block',
                    },
                }}
            >
                {pictures.map((pic) => (
                    <Box
                        key={pic.id}
                        sx={{
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                                transform: 'scale(1.02)',
                            },
                        }}
                    >
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
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                },
                            }}
                        >
                            {canEdit && (
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        color: 'red',
                                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                                        },
                                        zIndex: 1,
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeletePictureConfirm(true);
                                        setSelectedPictureToDelete(pic);
                                    }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            )}
                            <Image
                                onClick={() => handleImageClick(pic)}
                                src={pic.thumbnailUrl}
                                alt={`图片${pic.id}`}
                                width={500}
                                height={500}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    objectFit: 'cover',
                                }}
                                priority={false}
                                loading="lazy"
                            />
                        </Box>
                    </Box>
                ))}
            </Box>
            {canEdit && (
                <ConfirmDialog
                    isOpen={deletePictureConfirm}
                    onClose={() => setDeletePictureConfirm(false)}
                    title="删除图片"
                    content="确定要删除这张图片吗？"
                    primaryButton={{
                        text: '删除',
                        onClick: () => handleImageDelete(),
                        disabled: pictureDeleting,
                    }}
                    secondaryButton={{
                        text: '取消',
                        onClick: () => setDeletePictureConfirm(false),
                        disabled: pictureDeleting,
                    }}
                />
            )}

            {selectedPicture && (
                <ImagePreview
                    open={!!selectedPicture}
                    onClose={handleClose}
                    image={selectedPicture}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    hasPrevious={currentIndex > 0}
                    hasNext={currentIndex < pictures.length - 1}
                />
            )}
        </>
    );
}
