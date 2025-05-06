import { getPictureById } from "@/lib/picture";
import { NextResponse } from "next/server";
import { getSessionUser } from '@/lib/session/getSession'

// 获取图片详情
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getSessionUser()
        
        const picture = await getPictureById(parseInt(id))
        if (!picture) {
            return NextResponse.json({
              error: {
                message: '图片不存在',
                code: 'PICTURE_NOT_FOUND'
              }
            }, { status: 404 })
        }
        if (picture.isPrivate && picture.owner.id !== session.id) {
            return NextResponse.json({
              error: {
                message: '图片是私有的',
                code: 'PICTURE_PRIVATE'
              }
            }, { status: 403 })
        }
        return NextResponse.json(picture)
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
            message: '获取图片失败',
            code: 'PICTURE_GET_ERROR'
          }
        }, { status: 500 })
    }
}

