import {
    HeadObjectCommand,
    DeleteObjectCommand,
    NotFound,
} from '@aws-sdk/client-s3';
import PgBoss, { Job } from 'pg-boss';
import prisma from '../db';
import s3 from '@/lib/s3';

export type JobParams = {
    key: string;
};

async function exists(key: string) {
    try {
        const cmd = new HeadObjectCommand({
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
            Key: key,
        });
        await s3.send(cmd);
        return true;
    } catch (error) {
        if (error instanceof NotFound) {
            return false;
        } else {
            throw error;
        }
    }
}

export default async function recycleRunner(
    boss: PgBoss,
    { data: params }: Job<JobParams>,
) {
    const url = `https://${process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN}/${params.key}`;

    const count = await prisma.picture.count({
        where: {
            url,
        },
    });

    if (count !== 0) {
        return;
    }

    const f = await exists(params.key);

    if (!f) {
        return;
    }

    const cmd = new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: params.key,
    });

    await s3.send(cmd);
}
