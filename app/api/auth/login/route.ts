import { NextResponse } from 'next/server';
import { sessionOptions } from '@/lib/session/sessionOptions';
import { getIronSession } from 'iron-session';
import { getSessionUser } from '@/lib/session/getSession';
import prisma from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { SessionUser } from '@/lib/session/types';

export async function POST(request: Request) {
    const schema = z.object({
        email: z.string().email('邮箱格式不正确'),
        password: z
            .string()
            .min(8, '密码不能少于8个字符')
            .max(20, '密码不能超过20个字符'),
    });

    const result = schema.safeParse(await request.json());
    if (!result.success) {
        return NextResponse.json(
            {
                errors: result.error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            },
            { status: 400 },
        );
    }
    const { email, password } = result.data;
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        return NextResponse.json(
            {
                errors: [
                    {
                        field: 'email',
                        message: '用户不存在',
                    },
                ],
            },
            { status: 401 },
        );
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid === null) {
        return NextResponse.json(
            {
                errors: [
                    {
                        field: 'password',
                        message: '密码错误',
                    },
                ],
            },
            { status: 401 },
        );
    }
    if (!isPasswordValid) {
        return NextResponse.json(
            {
                errors: [
                    {
                        field: 'password',
                        message: '密码错误',
                    },
                ],
            },
            { status: 401 },
        );
    }

    const res = new Response();
    const session = await getIronSession<SessionUser>(
        request,
        res,
        sessionOptions,
    );

    session.id = user.id;
    session.email = user.email;
    session.name = user.name;
    await session.save();
    return new Response(
        JSON.stringify({
            success: true,
            message: '登录成功',
        }),
        {
            status: 200,
            headers: res.headers,
        },
    );
}

export async function GET() {
    const session = await getSessionUser();

    if (!session) {
        return NextResponse.json({ status: 401 });
    }
    return NextResponse.json(
        {
            id: session.id,
            email: session.email,
            name: session.name,
        },
        { status: 200 },
    );
}
