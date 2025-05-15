'use client';

import { Box, Typography, CircularProgress } from '@mui/material';
import { AlbumsGrid } from '@/app/_components/album';
import { useAlbums } from '@/lib/fetcher/fetchers';

export default function AlbumsPage() {
    const { albums, albumsErrors, albumsLoading } = useAlbums();

    if (albumsLoading) {
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
    if (albumsErrors && albumsErrors.length > 0) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                {albumsErrors.map(
                    (error: { field: string; message: string }) => (
                        <Typography key={error.field} color="error">
                            {error.message}
                        </Typography>
                    ),
                )}
            </Box>
        );
    }
    if (!albums || albums.length === 0) {
        return <Typography align="center">暂无图集</Typography>;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <AlbumsGrid albums={albums} />
        </Box>
    );
}
