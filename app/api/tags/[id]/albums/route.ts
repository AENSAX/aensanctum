import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAuth } from '@/lib/auth';

// 获取某标签下的所有图集
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const authId = await checkAuth();
    const { id } = await params;
    if (authId === -1) {
        return NextResponse.json(
            {
                errors: [
                    {
                        field: 'unauthorized',
                        message: '未授权',
                    },
                ],
            },
            { status: 401 },
        );
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const [albums, count] = await prisma.$transaction([
        prisma.album.findMany({
            where: {
                OR: [
                    { isPrivate: false, pictures: { some: {} } },
                    { ownerId: authId },
                ],
                tags: {
                    some: {
                        tagId: parseInt(id),
                    },
                },
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
        }),
        prisma.album.count({
            where: {
                OR: [
                    { isPrivate: false, pictures: { some: {} } },
                    { ownerId: authId },
                ],
                tags: {
                    some: {
                        tagId: parseInt(id),
                    },
                },
            },
        }),
    ]);
    const responseAlbums = {
        albums,
        count: count,
    };
    return NextResponse.json(responseAlbums, { status: 200 });
}
