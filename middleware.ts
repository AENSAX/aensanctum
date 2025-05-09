import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/session/getSession';

export async function middleware(request: NextRequest) {

  const session = await getSessionUser();
  let isAuth = false;
  if (session) {
    isAuth = true;
  }

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