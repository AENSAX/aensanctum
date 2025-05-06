import { getIronSession } from 'iron-session';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session/sessionOptions';


async function getIronSessionData() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionUser>(cookieStore, sessionOptions);
  return session;
}

export async function middleware(request: NextRequest) {

  const session = await getIronSessionData();
  const isAuth = session.id;

  const isLogin = request.nextUrl.pathname.startsWith('/login');
  const isMePage = request.nextUrl.pathname.startsWith('/me');
  const isPicturePage = request.nextUrl.pathname.startsWith('/picture') || 
  request.nextUrl.pathname.startsWith('/album') || 
  request.nextUrl.pathname.startsWith('/index/pictures') ||
  request.nextUrl.pathname.startsWith('/index/albums');

  if (isLogin && isAuth) {
    return NextResponse.redirect(new URL('/index/pictures', request.url));
  }

  if (isMePage && !isAuth) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isPicturePage && !isAuth) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}