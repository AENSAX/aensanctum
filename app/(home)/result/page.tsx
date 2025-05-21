'use client';

import {
    Box,
    Typography,
    CircularProgress,
    Pagination,
    Divider,
} from '@mui/material';
import { AlbumsGrid } from '@/app/_components/album';
import { useSearch } from '@/lib/fetcher/fetchers';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

export default function ResultPage() {
    return (
        <Suspense
            fallback={
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
            }
        >
            <SearchResultAlbumsPage />
        </Suspense>
    );
}

export function SearchResultAlbumsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const searchParams = useSearchParams();
    const keyword = searchParams.get('q') || '';
    const { paginatedAlbums, albumsErrors, albumsLoading } = useSearch(
        currentPage,
        keyword,
    );

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number,
    ) => {
        setCurrentPage(value);
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
    const currentAlbums = paginatedAlbums?.albums || [];
    const totalPages = paginatedAlbums?.count
        ? Math.ceil(paginatedAlbums.count / 10)
        : 0;

    return (
        <Box sx={{ mt: 4 }}>
            <Divider>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: '0.75rem' }}
                >
                    与{' '}
                    <span
                        style={{
                            color: 'rgb(255, 163, 169)',
                            fontSize: '1rem',
                        }}
                    >
                        {keyword.trim()}
                    </span>{' '}
                    匹配的结果
                </Typography>
            </Divider>

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
