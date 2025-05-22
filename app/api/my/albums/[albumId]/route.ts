import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { checkAuth } from '@/lib/auth';
import s3 from '@/lib/s3';
import { thumbnail } from '@/lib/workers';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ albumId: string }> },
) {
    const authId = await checkAuth();
    if (authId === -1) {
        return NextResponse.json({ status: 401 });
    }
    const { albumId } = await params;

    const album = await prisma.album.findUnique({
        where: {
            id: parseInt(albumId),
            ownerId: authId,
        },
        include: {
            pictures: {
                select: {
                    url: true,
                    thumbnailUrl: true,
                },
            },
        },
    });

    if (!album) {
        return NextResponse.json(
            {
                errors: [{ field: 'not_found', message: '图集不存在' }],
            },
            { status: 404 },
        );
    }

    const deletePromises: Promise<unknown>[] = [];
    for (const picture of album.pictures) {
        const originalFileName = getFileNameFromUrl(picture.url);
        deletePromises.push(
            s3.send(
                new DeleteObjectCommand({
                    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
                    Key: `images/${originalFileName}`,
                }),
            ),
        );

        const thumbnailFileName = getFileNameFromUrl(picture.thumbnailUrl);
        deletePromises.push(
            s3.send(
                new DeleteObjectCommand({
                    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
                    Key: `thumbnails/${thumbnailFileName}`,
                }),
            ),
        );
    }
    await Promise.all(deletePromises);

    await prisma.album.delete({
        where: {
            id: parseInt(albumId),
            ownerId: authId,
        },
    });
    await prisma.tag.deleteMany({
        where: {
            albums: {
                none: {},
            },
        },
    });

    return NextResponse.json({ message: '图集删除成功' }, { status: 200 });
}

// 更新我的图集
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ albumId: string }> },
) {
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
        return NextResponse.json({ status: 401 });
    }
    const { albumId } = await params;
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
    const searchText = name + tags.join('');

    const currentAlbum = await prisma.album.findUnique({
        where: {
            id: parseInt(albumId),
            ownerId: authId,
        },
    });
    if (!currentAlbum) {
        return NextResponse.json({ status: 404 });
    }
    const updatedData = {
        name: name || currentAlbum.name,
        searchText,
        isPrivate: isPrivate ?? currentAlbum.isPrivate,
    };
    await prisma.$transaction(async (tx) => {
        await tx.albumTag.deleteMany({
            where: { albumId: parseInt(albumId) },
        });
        const tagIds = await Promise.all(
            tags.map(async (t) => {
                const existTag = await tx.tag.findFirst({
                    where: { text: t },
                });
                if (existTag) {
                    return existTag.id;
                }
                const newTag = await tx.tag.create({
                    data: { text: t },
                });
                return newTag.id;
            }),
        );
        await tx.albumTag.createMany({
            data: tagIds.map((tagId) => ({
                albumId: parseInt(albumId),
                tagId,
            })),
        });
    });
    await prisma.album.update({
        where: {
            id: parseInt(albumId),
            ownerId: authId,
        },
        data: updatedData,
    });
    await prisma.tag.deleteMany({
        where: {
            albums: {
                none: {},
            },
        },
    });
    return NextResponse.json({ status: 200 });
}

function getFileNameFromUrl(url: string): string {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
}

const schema = z.object({
    urls: z.array(z.string().url()).min(1).max(10),
});

//上传图片
export async function POST(
    request: Request,
    { params }: { params: Promise<{ albumId: string }> },
) {
    const { albumId } = await params;
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
                        field: 'not_found',
                        message: '图集不存在',
                    },
                ],
            },
            { status: 404 },
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

    const { urls } = result.data;

    for (const url of urls) {
        await thumbnail(url, parseInt(albumId));
    }

    return NextResponse.json({ status: 200 });
}
