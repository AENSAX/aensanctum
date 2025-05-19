import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAuth } from '@/lib/auth';

//获取图集的图片列表
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);

    const pictures = await prisma.album.findUnique({
        where: { id: parseInt(id) },
        select: {
            ownerId: true,
            isPrivate: true,
            pictures: {
                select: {
                    albumId: true,
                    id: true,
                    url: true,
                    thumbnailUrl: true,
                },
                orderBy: {
                    id: 'asc',
                },
                skip: (page - 1) * 10,
                take: 10,
            },
        },
    });
    if (!pictures) {
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
    const isOwner = pictures.ownerId === authId;
    if (pictures.isPrivate && !isOwner) {
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
    const picturesResponse = pictures.pictures;
    return NextResponse.json(picturesResponse);
}
