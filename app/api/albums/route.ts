import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { checkAuth } from '@/lib/auth';
// 获取所有图集
export async function GET() {
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
    const albums = await prisma.album.findMany({
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
        orderBy: {
            id: 'desc',
        },
    });
    return NextResponse.json(albums, { status: 200 });
}

// 创建图集
export async function POST(request: Request) {
    const schema = z.object({
        name: z
            .string()
            .min(1, '图集名称不能为空')
            .max(100, '图集名称不能超过100个字符')
            .trim()
            .regex(
                /^[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/,
                '图集名称只能包含中英文、数字、空格和横杠',
            ),
        tags: z
            .array(
                z
                    .string()
                    .min(1, '标签不能为空')
                    .max(20, '标签不能超过20个字符')
                    .trim()
                    .regex(
                        /^[a-zA-Z0-9\u4e00-\u9fa5\- ]+$/,
                        '标签只能包含中英文、数字、空格和横杠',
                    ),
            )
            .min(1, '至少需要一个标签')
            .max(10, '最多只能添加10个标签'),
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

    const album = await prisma.album.create({
        data: {
            name,
            tags,
            isPrivate,
            ownerId: authId,
        },
    });
    return NextResponse.json(
        {
            id: album.id,
            message: '图集创建成功',
        },
        { status: 200 },
    );
}
