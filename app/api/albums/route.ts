import { NextResponse } from 'next/server'
import { createAlbum, getAllAlbums } from '@/lib/album'
import { cookies } from 'next/headers'

// 获取所有图集
export async function GET() {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('auth')

    if (!authCookie || authCookie.value !== 'true') {
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

    const albums = await getAllAlbums()
    const filteredAlbums = albums.filter(album => {
      const isOwner = album.owner.id === parseInt(userId)
      if (isOwner) {
        return true
      }
      return !album.isPrivate
    })
    for (const filteredAlbum of filteredAlbums) {
      filteredAlbum.albumPictures = filteredAlbum.albumPictures.filter(p => {
        const isOwner = p.owner.id === parseInt(userId)
        if (isOwner) {
          return true
        }
        return !p.isPrivate
      })
    }
    return NextResponse.json(filteredAlbums)
  } catch (error) {
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
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('auth')

    if (!authCookie || authCookie.value !== 'true') {
      return NextResponse.json({
        error: {
          message: '未登录',
          code: 'UNAUTHORIZED'
        }
      }, { status: 401 })
    }

    // 从 cookie 中获取用户ID
    const userId = cookieStore.get('userId')?.value
    if (!userId) {
      return NextResponse.json({
        error: {
          message: '用户ID未找到',
          code: 'USER_NOT_FOUND'
        }
      }, { status: 401 })
    }

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
    const album = await createAlbum(name, tags, parseInt(userId))
    return NextResponse.json(album)
  } catch (error) {
    return NextResponse.json({
      error: {
        message: '创建图集失败',
        code: 'ALBUM_CREATE_ERROR'
      }
    }, { status: 500 })
  }
} 