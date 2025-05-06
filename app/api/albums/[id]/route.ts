import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAlbumById } from '@/lib/album'

// 获取某个图集
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const cookieStore = await cookies()
        const cookie = cookieStore.get('auth')?.value
        if (!cookie) {
            return NextResponse.json({
              error: {
                message: '未登录',
                code: 'UNAUTHORIZED'
              }
            }, { status: 401 })
        }
        const userId = cookieStore.get('userId')?.value
        if (!userId) {
            return NextResponse.json({
              error: {
                message: '用户ID未找到',
                code: 'USER_NOT_FOUND'
              }
            }, { status: 401 })
        }
        const album = await getAlbumById(parseInt(id))
        if (!album) {
            return NextResponse.json({
              error: {
                message: '图集不存在',
                code: 'ALBUM_NOT_FOUND'
              }
            }, { status: 404 })
        }
        const isOwner = album.owner.id === parseInt(userId)
        if (album.isPrivate && !isOwner) {
            return NextResponse.json({
              error: {
                message: '图集是私有的',
                code: 'ALBUM_PRIVATE'
              }
            }, { status: 403 })
        }
        if (!isOwner) {
            album.albumPictures = album.albumPictures.filter(p => !p.isPrivate)
        }
        return NextResponse.json(album)
    } catch (error) {
        return NextResponse.json({
          error: {
            message: '获取图集失败',
            code: 'ALBUM_GET_ERROR'
          }
        }, { status: 500 })
    }
}