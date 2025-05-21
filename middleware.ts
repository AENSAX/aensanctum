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
    const isAlbumPage = request.nextUrl.pathname.startsWith('/albums');
    const isResultPage = request.nextUrl.pathname.startsWith('/result');
    const isTagPage = request.nextUrl.pathname.startsWith('/tags');

    if ((isMePage || isAlbumPage || isTagPage || isResultPage) && !isAuth) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
}
