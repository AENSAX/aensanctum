import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/user';
import { sessionOptions } from '@/lib/session/sessionOptions';
import { getIronSession } from 'iron-session';
import { getSessionUser } from '@/lib/session/getSession';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({
        error: { message: '用户不存在', code: 'USER_NOT_FOUND' }
      }, { status: 401 });
    }
    if (user.password !== password) {
      return NextResponse.json({
        error: { message: '密码错误', code: 'PASSWORD_ERROR' }
      }, { status: 401 });
    }

    const res = new Response();
    const session = await getIronSession<SessionUser>(request, res, sessionOptions);

    session.id = user.id;
    session.email = user.email;
    session.name = user.name;
    await session.save();
    return Response.json({
      success: true,
      message: '登录成功',
    }, {
      headers: res.headers,
    });
  } catch (error) {
    return NextResponse.json({
      error: { message: '服务器错误', code: 'SERVER_ERROR' }
    }, { status: 500 });
  }
}

export async function GET() {
  try {

    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json({
        error: { message: '未登录', code: 'UNAUTHORIZED' }
      }, { status: 401 });
    }

    return Response.json({
      id: session.id,
      email: session.email,
      name: session.name,
    },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json({
      error: { message: '服务器错误', code: 'SERVER_ERROR' }
    }, { status: 500 });
  }
} 