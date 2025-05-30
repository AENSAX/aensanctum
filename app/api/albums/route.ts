import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { checkAuth } from '@/lib/auth';

// 获取所有图集
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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const [albums, count] = await prisma.$transaction([
        prisma.album.findMany({
            where: {
                OR: [
                    { isPrivate: false, pictures: { some: {} } },
                    { ownerId: authId },
                ],
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
            },
        }),
    ]);
    const responseAlbums = {
        albums,
        count: count,
    };
    return NextResponse.json(responseAlbums, { status: 200 });
}

// 创建图集
export async function POST(request: Request) {
    const schema = z.object({
        name: z
            .string()
            .trim()
            .min(1, '图集名称不能为空')
            .max(100, '图集名称不能超过100个字符'),
        tags: z
            .array(
                z
                    .string()
                    .trim()
                    .min(1, '标签不能为空')
                    .max(100, '标签不能超过100个字符'),
            )
            .min(1, '至少需要一个标签')
            .max(50, '最多只能添加50个标签')
            .refine((tags) => new Set(tags).size === tags.length, {
                message: '标签不能重复',
            }),
        isPrivate: z.boolean({
            required_error: '缺少可见性信息',
        }),
    });
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
    const result = schema.safeParse(await request.json());
    if (!result.success) {
        return NextResponse.json(
            {
                errors: result.error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            },
            { status: 400 },
        );
    }
    const { name, tags, isPrivate } = result.data;
    const tagIds = await Promise.all(
        tags.map(async (t) => {
            const tag = await prisma.tag.upsert({
                where: { text: t },
                update: {},
                create: { text: t },
            });
            return tag.id;
        }),
    );
    const searchText = name + tags.join('');
    const album = await prisma.album.create({
        data: {
            name,
            isPrivate,
            ownerId: authId,
            searchText,
        },
    });
    await prisma.albumTag.createMany({
        data: tagIds.map((tagId) => ({
            tagId,
            albumId: album.id,
        })),
    });

    return NextResponse.json(
        {
            id: album.id,
            message: '图集创建成功',
        },
        { status: 200 },
    );
}
