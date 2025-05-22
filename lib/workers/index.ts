import PgBoss from 'pg-boss';
import thumbnailRunner, {
    type JobParams as ThumbnailParams,
} from './thumbnail';

export enum Jobs {
    thumbnail = 'thumbnail',
}

const singleton = async () => {
    const boss = new PgBoss(process.env.DATABASE_URL as string);
    boss.on('error', console.error);
    await boss.start();

    for (const key in Jobs) {
        await boss.createQueue(key);
    }
    await boss.work<ThumbnailParams>(Jobs.thumbnail, async ([job]) => {
        return thumbnailRunner(boss, job);
    });
    return boss;
};

declare global {
    // eslint-disable-next-line no-var
    var boss: undefined | Awaited<ReturnType<typeof singleton>>;
}

const boss = globalThis.boss ?? (await singleton());

if (process.env.NODE_ENV !== 'production') globalThis.boss = boss;

export async function thumbnail(imageURL: string, albumId: number) {
    await boss.send(
        Jobs.thumbnail,
        { albumId, imageURL },
        {
            retryLimit: 5,
            retryDelay: 300,
        },
    );
}
