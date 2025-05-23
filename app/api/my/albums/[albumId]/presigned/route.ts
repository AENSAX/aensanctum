import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { checkAuth } from '@/lib/auth';
import s3 from '@/lib/s3';

const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
] as const;

const schema = z.object({
    fileType: z.enum(allowedTypes as unknown as [string, ...string[]]),
    fileName: z.string().min(1),
});

export async function POST(
    request: Request,
    { params }: { params: Promise<{ albumId: string }> },
) {
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

    const { albumId } = await params;
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

    const { fileType, fileName } = result.data;
    const fileExtension = fileName.slice(fileName.lastIndexOf('.'));
    const now = new Date().toISOString();
    const timestamp = now.replace(/[:.]/g, '-');
    const uniqueFileName = `${timestamp}_${uuidv4()}${fileExtension}`;
    const key = `images/${uniqueFileName}`;

    const putCommand = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
    });

    try {
        const presignedUrl = await getSignedUrl(s3, putCommand, {
            expiresIn: 3600,
        });
        const publicUrl = `https://${process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN}/${key}`;

        return NextResponse.json({
            presignedUrl,
            publicUrl,
            key,
        });
    } catch {
        return NextResponse.json(
            {
                errors: [
                    {
                        field: 'internal_server_error',
                        message: '生成预签名URL失败',
                    },
                ],
            },
            { status: 500 },
        );
    }
}
