import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import prisma from '@/lib/db';

// 获取用户所有图集
export async function GET() {
    const authId = await checkAuth();
    if (authId === -1) {
        return NextResponse.json(
            {
                errors: [{
                    field: 'unauthorized',
                    message: '未授权'
                }]
            }, { status: 401 });
    }
    const albums = await prisma.album.findMany({
        where: {
            ownerId: authId
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
                }
            }
        }
    });

    return NextResponse.json(albums);
}
