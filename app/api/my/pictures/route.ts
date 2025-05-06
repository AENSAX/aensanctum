import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPictureListByOwnerId } from '@/lib/picture'

// 获取我的所有图片
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

        // 获取用户的图片列表
        const pictures = await getPictureListByOwnerId(parseInt(userId))

        // 返回图片列表
        return NextResponse.json(pictures)
    } catch (error) {
        console.error('Get picture list by owner id failed', error)
        return NextResponse.json({
          error: {
            message: '获取我的图片列表失败',
            code: 'MY_PICTURE_LIST_ERROR'
          }
        }, { status: 500 })
    }
}