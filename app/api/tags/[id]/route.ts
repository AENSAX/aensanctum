import { checkAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const authId = await checkAuth();
    const { id } = await params;
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
    const tag = await prisma.tag.findUnique({
        where: { id: parseInt(id) },
    });
    if (!tag) {
        return NextResponse.json(
            {
                errors: [
                    {
                        field: 'not_found',
                        message: '标签不存在',
                    },
                ],
            },
            { status: 404 },
        );
    }
    return NextResponse.json(tag, { status: 200 });
}
