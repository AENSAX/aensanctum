import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session/getSession';

export async function POST() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ status: 401 });
  }
  session.destroy();

  return NextResponse.json({ status: 200 });
}
