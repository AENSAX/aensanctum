import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import prisma from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

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
        where: { id: authId, isAdmin: true },
        select: {
            accessKey: true,
        },
    });
    if (!user) {
        return NextResponse.json(
            {
                errors: [{ field: 'user', message: '用户不存在' }],
            },
            { status: 404 },
        );
    }
    return NextResponse.json({ accessKey: user.accessKey });
}

export async function POST() {
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

    const newAccessKey = uuidv4();
    const user = await prisma.user.update({
        where: { id: authId, isAdmin: true },
        data: {
            accessKey: newAccessKey,
        },
    });
    if (!user) {
        return NextResponse.json(
            {
                errors: [
                    {
                        field: 'user',
                        message: '用户不存在',
                    },
                ],
            },
            { status: 404 },
        );
    }

    return NextResponse.json({ accessKey: user.accessKey });
}

export async function DELETE() {
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

    await prisma.user.update({
        where: { id: authId },
        data: {
            accessKey: null,
        },
    });

    return NextResponse.json({ status: 200 });
}
