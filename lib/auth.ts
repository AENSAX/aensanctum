import { getSessionUser } from '@/lib/session/getSession'
import prisma from '@/lib/db'

export async function checkAuth() : Promise<number> {
    const session = await getSessionUser()
    if (!session) {
        return -1
    }
    const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: {
            isActive: true,
        },
    });
    const isActive = user?.isActive || false;
    if (!isActive) {
        return -1
    }
    return session.id
}