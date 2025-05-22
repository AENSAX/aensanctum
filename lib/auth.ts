import { getSessionUser } from '@/lib/session';
import prisma from '@/lib/db';
import { headers } from 'next/headers';

export async function checkAuth(): Promise<number> {
    const session = await getSessionUser();
    if (session) {
        const user = await prisma.user.findUnique({
            where: { id: session.id },
            select: {
                isActive: true,
            },
        });
        const isActive = user?.isActive || false;
        if (!isActive) {
            return -1;
        }
        return session.id;
    }
    const accessKey = (await headers()).get('X-Access-Key');
    if (accessKey) {
        const user = await prisma.user.findUnique({
            where: { accessKey },
            select: {
                id: true,
                isActive: true,
            },
        });

        if (user && user.isActive) {
            return user.id;
        }
    }
    return -1;
}
