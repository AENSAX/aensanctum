import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAuth } from '@/lib/auth';

// 获取图集列表
export async function GET(request: Request) {
    const authId = await checkAuth();
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
    const user = await prisma.user.findUnique({
        where: { id: authId },
        select: {
            isAdmin: true,
        },
    });
    if (!user || !user.isAdmin) {
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
    const albums = await prisma.album.findMany({
        select: {
            id: true,
            name: true,
            createdAt: true,
            ownerId: true,
        },
        skip: (page - 1) * 10,
        take: 10,
        orderBy: {
            id: 'desc',
        },
    });
    return NextResponse.json(albums);
}
