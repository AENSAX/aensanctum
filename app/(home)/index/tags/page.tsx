'use client';

import {
    Box,
    Pagination,
    Container,
    Alert,
    CircularProgress,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import { useTags } from '@/lib/fetchers';
import { TagCard } from '@/app/_components/tag';

export default function TagsPage() {
    const colors = ['rgb(255, 255, 255)', 'rgba(255, 209, 221, 0.23)'];
    const [page, setPage] = useState(1);
    const { paginatedTags, tagsErrors, tagsLoading } = useTags(page);

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number,
    ) => {
        setPage(value);
    };

    if (tagsErrors && tagsErrors.length > 0) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ mt: 4 }}>
                    {tagsErrors.map(
                        (error: { field: string; message: string }) => (
                            <Alert
                                key={error.field}
                                severity="error"
                                sx={{ mb: 2 }}
                            >
                                {error.message}
                            </Alert>
                        ),
                    )}
                </Box>
            </Container>
        );
    }

    const currentTags = paginatedTags?.tags || [];
    const totalPages = paginatedTags?.count
        ? Math.ceil(paginatedTags.count / 20)
        : 0;

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 6 }}>
                <Box>
                    {tagsLoading ? (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '200px',
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : currentTags.length === 0 ? (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '200px',
                            }}
                        >
                            <Typography>暂无标签数据</Typography>
                        </Box>
                    ) : (
                        <>
                            <Box
                                sx={{
                                    bgcolor: 'background.paper',
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                {currentTags.map((tag, index) => (
                                    <TagCard
                                        key={tag.id}
                                        tag={tag}
                                        color={colors[index % colors.length]}
                                    />
                                ))}
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    mt: 2,
                                }}
                            >
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="small"
                                />
                            </Box>
                        </>
                    )}
                </Box>
            </Box>
        </Container>
    );
}
