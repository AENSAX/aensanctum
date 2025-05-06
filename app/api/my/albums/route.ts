import { NextResponse } from 'next/server';
import { getAlbumsByOwnerId } from '@/lib/album';
import { getSessionUser } from '@/lib/session/getSession';

// 获取我的所有图集
export async function GET() {
    try {
        const session = await getSessionUser();

        // 获取用户的图集列表
        const albums = await getAlbumsByOwnerId(session.id);

        // 返回图集列表
        return NextResponse.json(albums);
    } catch (error: any) {
        if (error.message === 'UNAUTHORIZED') {
            return NextResponse.json({
              error: {
                message: '未登录',
                code: 'UNAUTHORIZED'
              }
            }, { status: 401 })
        }
        return NextResponse.json({
            error: {
                message: '获取图集列表失败',
                code: 'ALBUM_LIST_ERROR'
            }
        }, { status: 500 });
    }
}
