import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAuth } from '@/lib/auth';

// 获取用户列表
export async function GET() {
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
    const user = await prisma.user.findUnique({
        where: { id: authId },
        select: {
            isAdmin: true,
        },
    });
    if (!user || !user.isAdmin) {
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
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            isAdmin: true,
            isActive: true,
        },
        orderBy: {
            id: 'asc',
        },
    });
    return NextResponse.json(users);
}
