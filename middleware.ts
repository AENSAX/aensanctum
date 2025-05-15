import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/session/getSession';

export async function middleware(request: NextRequest) {
    const session = await getSessionUser();
    let isAuth = false;
    if (session) {
        isAuth = true;
    }

    const isMePage = request.nextUrl.pathname.startsWith('/me');
    const isAlbumPage =
        request.nextUrl.pathname.startsWith('/album') ||
        request.nextUrl.pathname.startsWith('/index/albums');

    if (isMePage && !isAuth) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isAlbumPage && !isAuth) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}
