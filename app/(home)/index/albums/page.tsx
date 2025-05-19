'use client';

import { Box, Typography, CircularProgress, Pagination } from '@mui/material';
import { AlbumsGrid } from '@/app/_components/album';
import { useAlbums } from '@/lib/fetcher/fetchers';
import { Album } from '@/lib/interfaces/interfaces';
import { useState } from 'react';

export default function AlbumsPage() {
    const [currentPage, setCurrentPage] = useState(1);

    const getIndex = (index: number, previousPageData: Album[]) => {
        if (previousPageData && previousPageData.length === 0) {
            return null;
        }
        return `/api/albums?page=${index + 1}`;
    };

    const { paginatedAlbums, albumsErrors, albumsLoading, setSize } =
        useAlbums(getIndex);

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number,
    ) => {
        setCurrentPage(value);
        setSize(value);
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

    const currentAlbums = paginatedAlbums?.[currentPage - 1] || [];
    const totalPages =
        currentAlbums.length < 10 ? currentPage : currentPage + 1;

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
                            page={currentPage}
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
