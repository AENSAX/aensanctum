import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAuth } from '@/lib/auth';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    },
});

function getFileNameFromUrl(url: string): string {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const authId = await checkAuth();
    if (authId === -1) {
        return NextResponse.json(
            {
                errors: [{ field: 'unauthorized', message: '未授权' }],
            },
            { status: 401 },
        );
    }
    const { id } = await params;
    const user = await prisma.user.findUnique({
        where: { id: authId },
        select: {
            isAdmin: true,
        },
    });
    if (!user || !user.isAdmin) {
        return NextResponse.json(
            {
                errors: [{ field: 'unauthorized', message: '未授权' }],
            },
            { status: 401 },
        );
    }

    const album = await prisma.album.findUnique({
        where: {
            id: parseInt(id),
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

    try {
        await Promise.all(deletePromises);

        await prisma.album.delete({
            where: {
                id: parseInt(id),
            },
        });

        return NextResponse.json({ message: '图集删除成功' }, { status: 200 });
    } catch (error) {
        console.error('删除图集失败:', error);
        return NextResponse.json(
            {
                errors: [
                    {
                        field: 'delete',
                        message: '删除图集失败，请稍后重试',
                    },
                ],
            },
            { status: 500 },
        );
    }
}
