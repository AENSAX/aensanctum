import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from './sessionOptions';
import { SessionUser } from './types';

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
