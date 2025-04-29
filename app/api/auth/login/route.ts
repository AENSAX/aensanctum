import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // TODO: 这里需要添加实际的用户验证逻辑
    // 临时模拟验证
    if (email === 'test@example.com' && password === 'password') {
      // 设置登录状态
      (await cookies()).set('auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 一周
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: '无效的邮箱或密码' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
} 