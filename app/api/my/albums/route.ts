import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session/getSession';
import prisma from '@/lib/db';

// 获取用户所有图集
export async function GET() {
    const session = await getSessionUser();
    if (!session) {
        return NextResponse.json({ status: 401 });
    }
    const albums = await prisma.album.findMany({
        where: {
            ownerId: session.id,
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
    });

    return NextResponse.json(albums);
}
