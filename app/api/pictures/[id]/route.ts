import { deletePicture, getPictureById, updatePicture } from "@/lib/picture";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 获取图片详情
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const cookieStore = await cookies();
        const auth = cookieStore.get('auth')?.value
        if (!auth) {
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
        const picture = await getPictureById(parseInt(id))
        if (!picture) {
            return NextResponse.json({
              error: {
                message: '图片不存在',
                code: 'PICTURE_NOT_FOUND'
              }
            }, { status: 404 })
        }
        if (picture.isPrivate && picture.owner.id !== parseInt(userId)) {
            return NextResponse.json({
              error: {
                message: '图片是私有的',
                code: 'PICTURE_PRIVATE'
              }
            }, { status: 403 })
        }
        return NextResponse.json(picture)
    } catch (error) {
        return NextResponse.json({
          error: {
            message: '获取图片失败',
            code: 'PICTURE_GET_ERROR'
          }
        }, { status: 500 })
    }
}

