import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session/getSession';
import prisma from '@/lib/db';

// 获取某个图集
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const session = await getSessionUser();
    if (!session) {
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
    const album = await prisma.album.findUnique({
        where: { id: parseInt(id) },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                },
            },
            pictures: {
                select: {
                    id: true,
                    url: true,
                    albumId: true,
                    thumbnailUrl: true,
                },
            },
        },
    });
    if (!album) {
        return NextResponse.json(
            {
                errors: [
                    {
                        field: 'not_found',
                        message: '图集不存在',
                    },
                ],
            },
            { status: 404 },
        );
    }
    const isOwner = album.ownerId === session.id;
    if (album.isPrivate && !isOwner) {
        return NextResponse.json(
            {
                errors: [
                    {
                        field: 'forbidden',
                        message: '无权限访问',
                    },
                ],
            },
            { status: 403 },
        );
    }
    const albumResponse = {
        ...album,
        createdAt: album.createdAt.toISOString(),
    };
    return NextResponse.json(albumResponse);
}
