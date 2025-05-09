import { NextResponse } from 'next/server'
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session/sessionOptions';
import { getIronSession } from 'iron-session';

export async function POST() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionUser>(cookieStore, sessionOptions);
  session.destroy();

  return NextResponse.json(
    {
      success: true,
      message: '登出成功'
    },
    {
      status: 200,
    }
  );
}
