'use client';

import { Tag } from '@/lib/types';
import { Typography } from '@mui/material';
import Link from 'next/link';

interface TagCardProps {
    tag: Tag;
    color: string;
}

export function TagCard({ tag, color }: TagCardProps) {
    return (
        <Link href={`/tags/${tag.id}`} style={{ textDecoration: 'none' }}>
            <Typography
                component="div"
                sx={{
                    p: '4px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.9rem',
                    color: 'rgb(99, 77, 242)',
                    backgroundColor: color,
                    '&:hover': {
                        backgroundColor: 'rgba(102, 80, 86, 0.23)',
                    },
                }}
            >
                <span># {tag.text}</span>
                <span style={{ color: '#666' }}>{tag._count.albums}</span>
            </Typography>
        </Link>
    );
}
