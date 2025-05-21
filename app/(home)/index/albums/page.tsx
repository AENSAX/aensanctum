'use client';

import { Box, Typography, CircularProgress, Pagination } from '@mui/material';
import { AlbumsGrid } from '@/app/_components/album';
import { useAlbums } from '@/lib/fetcher/fetchers';
import { useState } from 'react';

export default function AlbumsPage() {
    const [page, setPage] = useState(1);
    const { paginatedAlbums, albumsErrors, albumsLoading } = useAlbums(page);

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number,
    ) => {
        setPage(value);
    };

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

    const currentAlbums = paginatedAlbums?.albums || [];
    const totalPages = paginatedAlbums?.count
        ? Math.ceil(paginatedAlbums.count / 10)
        : 0;

    return (
        <Box sx={{ mt: 4 }}>
            {albumsLoading ? (
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
            ) : currentAlbums.length === 0 ? (
                <Typography align="center">暂无图集</Typography>
            ) : (
                <>
                    <AlbumsGrid albums={currentAlbums} />
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mt: 4,
                            mb: 2,
                        }}
                    >
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                        />
                    </Box>
                </>
            )}
        </Box>
    );
}
