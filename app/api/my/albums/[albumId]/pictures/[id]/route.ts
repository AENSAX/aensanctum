import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAuth } from '@/lib/auth';
// 从图集中删除图片
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ albumId: string; id: string }> },
) {
    const authId = await checkAuth();
    if (authId === -1) {
        return NextResponse.json(
            {
                errors: [
                    {
                        field: 'session',
                        message: '请先登录',
                    },
                ],
            },
            { status: 401 },
        );
    }
    const { albumId, id } = await params;
    const album = await prisma.album.findFirst({
        where: {
            id: parseInt(albumId),
            ownerId: authId,
        },
    });

    if (!album) {
        return NextResponse.json(
            {
                errors: [
                    {
                        field: 'album',
                        message: '图集不存在或没有权限',
                    },
                ],
            },
            { status: 404 },
        );
    }

    const picture = await prisma.picture.findFirst({
        where: {
            id: parseInt(id),
            albumId: parseInt(albumId),
        },
    });

    if (!picture) {
        return NextResponse.json(
            {
                errors: [
                    {
                        field: 'picture',
                        message: '图片不存在或没有权限',
                    },
                ],
            },
            { status: 404 },
        );
    }

    await prisma.picture.delete({
        where: {
            id: parseInt(id),
        },
    });

    return NextResponse.json({ status: 200 });
}
