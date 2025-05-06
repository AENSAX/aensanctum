import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAlbumsByOwnerId } from '@/lib/album';

// 获取我的所有图集
export async function GET() {
    try {
        const cookieStore = await cookies();
        const authCookie = cookieStore.get('auth');

        if (!authCookie || authCookie.value !== 'true') {
            return NextResponse.json({ error: '未登录' }, { status: 401 });
        }

        const userId = cookieStore.get('userId')?.value;

        if (!userId) {
            return NextResponse.json({ error: '用户ID未找到' }, { status: 401 });
        }

        // 获取用户的图集列表
        const albums = await getAlbumsByOwnerId(parseInt(userId));

        // 返回图集列表
        return NextResponse.json(albums);
    } catch (error) {
        return NextResponse.json({
            error: {
                message: '获取图集列表失败',
                code: 'ALBUM_LIST_ERROR'
            }
        }, { status: 500 });
    }
}
