import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import prisma from '@/lib/db';

// 获取用户所有图集
export async function GET(request: Request) {
    const authId = await checkAuth();
    if (authId === -1) {
        return NextResponse.json({ status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const albums = await prisma.album.findMany({
        where: {
            ownerId: authId,
        },
        select: {
            id: true,
            isPrivate: true,
            ownerId: true,
            pictures: {
                take: 1,
                select: {
                    id: true,
                    url: true,
                    albumId: true,
                    thumbnailUrl: true,
                },
            },
        },
        skip: (page - 1) * 10,
        take: 10,
        orderBy: {
            id: 'desc',
        },
    });

    return NextResponse.json(albums);
}
