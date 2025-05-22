import { cookies } from 'next/headers';
import { getIronSession, SessionOptions } from 'iron-session';

export const sessionOptions: SessionOptions = {
    password: process.env.SECRET_COOKIE_PASSWORD as string,
    cookieName: 'aenstSession',
    cookieOptions: {
        secure: false,
    },
};

export type SessionUser = {
    id: number;
    email: string;
    name: string;
};

export async function getSessionUser() {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionUser>(
        cookieStore,
        sessionOptions,
    );
    if (!session.id) {
        return null;
    }
    return session;
}
