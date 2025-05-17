import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAuth } from '@/lib/auth';

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
    await prisma.album.delete({
        where: {
            id: parseInt(id),
        },
    });
    return NextResponse.json({ message: '图集删除成功' }, { status: 200 });
}
