import { PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import PgBoss, { Job } from 'pg-boss';
import prisma from '../db';
import s3 from '@/lib/s3';
import _ from 'lodash';

export type JobParams = {
    albumId: number;
    imageURL: string;
};

export default async function thumbnailRunner(
    boss: PgBoss,
    { data: params, id, name }: Job<JobParams>,
) {
    const response = await fetch(params.imageURL);

    if (!response.ok || !response.body) {
        await boss.fail(name, id);

        return;
    }

    const buf = await response.arrayBuffer();

    const thumbnailBuffer = await sharp(buf)
        .resize(600, 600, {
            fit: 'inside',
            withoutEnlargement: true,
            position: 'centre',
        })
        .jpeg({ quality: 80 })
        .toBuffer();
    const basename = _.last(new URL(params.imageURL).pathname.split('/'))!;
    const thumbnailFileName = `thumb_${basename}`;
    const thumbnailKey = `thumbnails/${thumbnailFileName}`;

    const putCommand = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
    });

    await s3.send(putCommand);

    const thumbnailURL = `https://${process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN}/${thumbnailKey}`;

    await prisma.picture.create({
        data: {
            url: params.imageURL,
            album: {
                connect: {
                    id: params.albumId,
                },
            },
            thumbnailUrl: thumbnailURL,
        },
    });
}
