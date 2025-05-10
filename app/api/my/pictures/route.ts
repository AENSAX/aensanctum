import { NextResponse } from 'next/server'
import { getPictureListByOwnerId } from '@/lib/picture'
import { getSessionUser } from '@/lib/session/getSession'

// 获取我的所有图片
export async function GET() {
    try {
        const session = await getSessionUser()
        if (!session) {
            return NextResponse.json({ status: 401 })
        }
        // 获取用户的图片列表
        const pictures = await getPictureListByOwnerId(session.id)

        // 返回图片列表
        return NextResponse.json(pictures)
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
            message: '获取我的图片列表失败',
            code: 'MY_PICTURE_LIST_ERROR'
          }
        }, { status: 500 })
    }
}