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
    const [albums, count] = await prisma.$transaction([
        prisma.album.findMany({
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
        }),
        prisma.album.count({}),
    ]);
    const responseAlbums = {
        albums,
        count: count,
    };
    return NextResponse.json(responseAlbums, { status: 200 });
}
export async function POST() {
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
    const updatedCount = await prisma.$transaction(async (tx) => {
        // 获取所有相册及其标签
        const albums = await tx.album.findMany({
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });
        // 批量更新每个相册的 searchText
        const updates = albums.map((album) => {
            const tagTexts = album.tags.map((albumTag) => albumTag.tag.text);
            const searchText = album.name + tagTexts.join('');

            return tx.album.update({
                where: { id: album.id },
                data: { searchText },
            });
        });
        const results = await Promise.all(updates);
        return results.length;
    });

    return NextResponse.json(
        {
            message: `成功更新 ${updatedCount} 个相册的搜索文本`,
            count: updatedCount,
        },
        { status: 200 },
    );
}
