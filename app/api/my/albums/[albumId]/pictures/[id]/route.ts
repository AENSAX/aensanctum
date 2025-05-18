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
        select: {
            id: true,
            url: true,
            thumbnailUrl: true,
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
    const deletePromises: Promise<unknown>[] = [];

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

    await Promise.all(deletePromises);

    await prisma.picture.delete({
        where: {
            id: parseInt(id),
        },
    });

    return NextResponse.json({ status: 200 });
}
