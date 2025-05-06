import { NextResponse } from 'next/server'
import { getAlbumById } from '@/lib/album'
import { getSessionUser } from '@/lib/session/getSession'

// 获取某个图集
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getSessionUser()
        
        const album = await getAlbumById(parseInt(id))
        if (!album) {
            return NextResponse.json({
              error: {
                message: '图集不存在',
                code: 'ALBUM_NOT_FOUND'
              }
            }, { status: 404 })
        }
        const isOwner = album.owner.id === session.id
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
            message: '获取图集失败',
            code: 'ALBUM_GET_ERROR'
          }
        }, { status: 500 })
    }
}