import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAuth } from '@/lib/auth';

// 获取所有tags
export async function GET(request: Request) {
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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);

    const [tags, count] = await prisma.$transaction([
        prisma.tag.findMany({
            where: {},
            skip: (page - 1) * 20,
            take: 20,
            include: {
                _count: {
                    select: {
                        albums: true,
                    },
                },
            },
            orderBy: {
                albums: {
                    _count: 'desc',
                },
            },
        }),
        prisma.tag.count(),
    ]);
    const tagsResponse = {
        tags,
        count,
    };
    return NextResponse.json(tagsResponse, { status: 200 });
}
