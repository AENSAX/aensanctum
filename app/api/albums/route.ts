import { NextResponse } from 'next/server'
import { createAlbum, getAllAlbums } from '@/lib/album'
import { getSessionUser } from '@/lib/session/getSession'

// 获取所有图集
export async function GET() {
  try {
    const session = await getSessionUser()

    const albums = await getAllAlbums()
    const filteredAlbums = albums.filter(album => {
      const isOwner = album.owner.id === session.id
      if (isOwner) {
        return true
      }
      return !album.isPrivate
    })
    for (const filteredAlbum of filteredAlbums) {
      filteredAlbum.albumPictures = filteredAlbum.albumPictures.filter(p => {
        const isOwner = p.owner.id === session.id
        if (isOwner) {
          return true
        }
        return !p.isPrivate
      })
    }
    return NextResponse.json(filteredAlbums)
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
    }, { status: 500 })
  }
}

// 创建图集
export async function POST(request: Request) {
  try {
    const session = await getSessionUser()

    // 解析请求体
    const { name, tags } = await request.json()
    if (!name) {
      return NextResponse.json({
        error: {
          message: '图集名称不能为空',
          code: 'EMPTY_ALBUM_NAME'
        }
      }, { status: 400 })
    }

    // 创建图集
    const album = await createAlbum(name, tags, session.id)
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
        message: '创建图集失败',
        code: 'ALBUM_CREATE_ERROR'
      }
    }, { status: 500 })
  }
} 